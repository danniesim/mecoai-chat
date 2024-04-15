import {
  useRef,
  useState,
  useEffect,
  useContext,
  useLayoutEffect,
} from "react";
import { DialogFooter, Stack } from "@fluentui/react";
import {
  Text,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";
import {
  SquareRegular,
  ErrorCircleRegular,
  Add48Regular,
  BroomRegular,
  StopRegular,
  Delete16Regular as DeleteIcon,
  ArrowExitFilled as ExitIcon,
} from "@fluentui/react-icons";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import uuid from "react-uuid";
import { isEmpty } from "lodash-es";
import DOMPurify from "dompurify";

import styles from "./Chat.module.css";
import { XSSAllowTags } from "../../constants/xssAllowTags";

import {
  ChatMessage,
  ConversationRequest,
  conversationApi,
  Citation,
  ToolMessageContent,
  ChatResponse,
  Conversation,
  historyGenerate,
  historyUpdate,
  historyClear,
  ChatHistoryLoadingState,
  CosmosDBStatus,
  ErrorMessage,
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ChatHistoryPanel } from "../../components/ChatHistory/ChatHistoryPanel";
import { Splash } from "../../components/Splash";
import { AppStateContext } from "../../state/AppProvider";
import { Home } from "../Home";
import { CheckChatHistory } from "./CheckChatHistory";

const enum messageStatus {
  NotRunning = "Not Running",
  Processing = "Processing",
  Done = "Done",
}

const Chat = () => {
  const appStateContext = useContext(AppStateContext);
  const user_id = appStateContext?.state.userId || null;
  const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<Citation>();
  const [isCitationPanelOpen, setIsCitationPanelOpen] =
    useState<boolean>(false);
  const abortFuncs = useRef([] as AbortController[]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processMessages, setProcessMessages] = useState<messageStatus>(
    messageStatus.NotRunning
  );
  const [clearingChat, setClearingChat] = useState<boolean>(false);
  const [hideErrorDialog, setHideErrorDialog] = useState(true);
  const [errorMsg, setErrorMsg] = useState<ErrorMessage | null>();

  const errorDialogContentProps = {
    title: errorMsg?.title,
    closeButtonAriaLabel: "Close",
    subText: errorMsg?.subtitle,
  };

  const modalProps = {
    titleAriaId: "labelId",
    subtitleAriaId: "subTextId",
    isBlocking: true,
    styles: { main: { maxWidth: 450 } },
  };

  const [ASSISTANT, TOOL, ERROR] = ["assistant", "tool", "error"];

  useEffect(() => {
    if (
      appStateContext?.state.isCosmosDBAvailable?.status !==
        CosmosDBStatus.Working &&
      appStateContext?.state.isCosmosDBAvailable?.status !==
        CosmosDBStatus.NotConfigured &&
      appStateContext?.state.chatHistoryLoadingState ===
        ChatHistoryLoadingState.Fail &&
      hideErrorDialog
    ) {
      let subtitle = `${appStateContext.state.isCosmosDBAvailable.status}. Please contact the site administrator.`;
      setErrorMsg({
        title: "Chat history is not enabled",
        subtitle: subtitle,
      });
      setHideErrorDialog(false);
    }
  }, [appStateContext?.state.isCosmosDBAvailable]);

  const handleErrorDialogClose = () => {
    setHideErrorDialog(true);
    setTimeout(() => {
      setErrorMsg(null);
    }, 500);
  };

  useEffect(() => {
    setIsLoading(
      appStateContext?.state.chatHistoryLoadingState ===
        ChatHistoryLoadingState.Loading
    );
  }, [appStateContext?.state.chatHistoryLoadingState]);

  let assistantMessage = {} as ChatMessage;
  let toolMessage = {} as ChatMessage;
  let assistantContent = "";

  const processResultMessage = (
    resultMessage: ChatMessage,
    userMessage: ChatMessage,
    conversationId?: string
  ) => {
    if (resultMessage.role === ASSISTANT) {
      assistantContent += resultMessage.content;
      assistantMessage = resultMessage;
      assistantMessage.content = assistantContent;

      if (resultMessage.context) {
        toolMessage = {
          id: uuid(),
          role: TOOL,
          content: resultMessage.context,
          date: new Date().toISOString(),
        };
      }
    }

    if (resultMessage.role === TOOL) toolMessage = resultMessage;

    if (!conversationId) {
      isEmpty(toolMessage)
        ? setMessages([...messages, userMessage, assistantMessage])
        : setMessages([
            ...messages,
            userMessage,
            toolMessage,
            assistantMessage,
          ]);
    } else {
      isEmpty(toolMessage)
        ? setMessages([...messages, assistantMessage])
        : setMessages([...messages, toolMessage, assistantMessage]);
    }
  };

  const makeApiRequestWithoutCosmosDB = async (
    question: string,
    conversationId?: string
  ) => {
    setIsLoading(true);
    setShowLoadingMessage(true);
    const abortController = new AbortController();
    abortFuncs.current.unshift(abortController);

    const userMessage: ChatMessage = {
      id: uuid(),
      role: "user",
      content: question,
      date: new Date().toISOString(),
    };

    let conversation: Conversation | null | undefined;
    if (!conversationId) {
      conversation = {
        id: conversationId ?? uuid(),
        title: question,
        messages: [userMessage],
        date: new Date().toISOString(),
      };
    } else {
      conversation = appStateContext?.state?.currentChat;
      if (!conversation) {
        console.error("Conversation not found.");
        setIsLoading(false);
        setShowLoadingMessage(false);
        abortFuncs.current = abortFuncs.current.filter(
          (a) => a !== abortController
        );
        return;
      } else {
        conversation.messages.push(userMessage);
      }
    }

    appStateContext?.dispatch({
      type: "UPDATE_CURRENT_CHAT",
      payload: conversation,
    });
    setMessages(conversation.messages);

    const request: ConversationRequest = {
      messages: [
        ...conversation.messages.filter((answer) => answer.role !== ERROR),
      ],
    };

    let result = {} as ChatResponse;
    try {
      const response = await conversationApi(request, abortController.signal);
      if (response?.body) {
        const reader = response.body.getReader();

        let runningText = "";
        while (true) {
          setProcessMessages(messageStatus.Processing);
          const { done, value } = await reader.read();
          if (done) break;

          var text = new TextDecoder("utf-8").decode(value);
          const objects = text.split("\n");
          objects.forEach((obj) => {
            try {
              if (obj !== "" && obj !== "{}") {
                runningText += obj;
                result = JSON.parse(runningText);
                if (result.choices?.length > 0) {
                  result.choices[0].messages.forEach((msg) => {
                    msg.id = result.id;
                    msg.date = new Date().toISOString();
                  });
                  if (
                    result.choices[0].messages?.some(
                      (m) => m.role === ASSISTANT
                    )
                  ) {
                    setShowLoadingMessage(false);
                  }
                  result.choices[0].messages.forEach((resultObj) => {
                    processResultMessage(
                      resultObj,
                      userMessage,
                      conversationId
                    );
                  });
                } else if (result.error) {
                  throw Error(result.error);
                }
                runningText = "";
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                console.error(e);
                throw e;
              } else {
                console.log("Incomplete message. Continuing...");
              }
            }
          });
        }
        conversation.messages.push(toolMessage, assistantMessage);
        appStateContext?.dispatch({
          type: "UPDATE_CURRENT_CHAT",
          payload: conversation,
        });
        setMessages([...messages, toolMessage, assistantMessage]);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        let errorMessage =
          "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
        if (result.error?.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === "string") {
          errorMessage = result.error;
        }
        let errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: errorMessage,
          date: new Date().toISOString(),
        };
        conversation.messages.push(errorChatMsg);
        appStateContext?.dispatch({
          type: "UPDATE_CURRENT_CHAT",
          payload: conversation,
        });
        setMessages([...messages, errorChatMsg]);
      } else {
        setMessages([...messages, userMessage]);
      }
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      abortFuncs.current = abortFuncs.current.filter(
        (a) => a !== abortController
      );
      setProcessMessages(messageStatus.Done);
    }

    return abortController.abort();
  };

  const makeApiRequestWithCosmosDB = async (
    question: string,
    conversationId?: string
  ) => {
    setIsLoading(true);
    setShowLoadingMessage(true);
    const abortController = new AbortController();
    abortFuncs.current.unshift(abortController);

    const userMessage: ChatMessage = {
      id: uuid(),
      role: "user",
      content: question,
      date: new Date().toISOString(),
    };

    //api call params set here (generate)
    let request: ConversationRequest;
    let conversation;
    if (conversationId) {
      conversation = appStateContext?.state?.chatHistory?.find(
        (conv) => conv.id === conversationId
      );
      if (!conversation) {
        console.error("Conversation not found.");
        setIsLoading(false);
        setShowLoadingMessage(false);
        abortFuncs.current = abortFuncs.current.filter(
          (a) => a !== abortController
        );
        return;
      } else {
        conversation.messages.push(userMessage);
        request = {
          messages: [
            ...conversation.messages.filter((answer) => answer.role !== ERROR),
          ],
        };
      }
    } else {
      request = {
        messages: [userMessage].filter((answer) => answer.role !== ERROR),
      };
      setMessages(request.messages);
    }
    let result = {} as ChatResponse;
    try {
      const response = conversationId
        ? await historyGenerate(request, abortController.signal, conversationId)
        : await historyGenerate(request, abortController.signal);
      if (!response?.ok) {
        const responseJson = await response.json();
        var errorResponseMessage =
          responseJson.error === undefined
            ? "Please try again. If the problem persists, please contact the site administrator."
            : responseJson.error;
        let errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: `There was an error generating a response. Chat history can't be saved at this time. ${errorResponseMessage}`,
          date: new Date().toISOString(),
        };
        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(
            (conv) => conv.id === conversationId
          );
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(
              (a) => a !== abortController
            );
            return;
          }
          resultConversation.messages.push(errorChatMsg);
        } else {
          setMessages([...messages, userMessage, errorChatMsg]);
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(
            (a) => a !== abortController
          );
          return;
        }
        appStateContext?.dispatch({
          type: "UPDATE_CURRENT_CHAT",
          payload: resultConversation,
        });
        setMessages([...resultConversation.messages]);
        return;
      }
      if (response?.body) {
        const reader = response.body.getReader();

        let runningText = "";
        while (true) {
          setProcessMessages(messageStatus.Processing);
          const { done, value } = await reader.read();
          if (done) break;

          var text = new TextDecoder("utf-8").decode(value);
          const objects = text.split("\n");
          objects.forEach((obj) => {
            try {
              if (obj !== "" && obj !== "{}") {
                runningText += obj;
                result = JSON.parse(runningText);
                if (result.choices?.length > 0) {
                  result.choices[0].messages.forEach((msg) => {
                    msg.id = result.id;
                    msg.date = new Date().toISOString();
                  });
                  if (
                    result.choices[0].messages?.some(
                      (m) => m.role === ASSISTANT
                    )
                  ) {
                    setShowLoadingMessage(false);
                  }
                  result.choices[0].messages.forEach((resultObj) => {
                    processResultMessage(
                      resultObj,
                      userMessage,
                      conversationId
                    );
                  });
                }
                runningText = "";
              } else if (result.error) {
                throw Error(result.error);
              }
            } catch (e) {
              if (!(e instanceof SyntaxError)) {
                console.error(e);
                throw e;
              } else {
                console.log("Incomplete message. Continuing...");
              }
            }
          });
        }

        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(
            (conv) => conv.id === conversationId
          );
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(
              (a) => a !== abortController
            );
            return;
          }
          isEmpty(toolMessage)
            ? resultConversation.messages.push(assistantMessage)
            : resultConversation.messages.push(toolMessage, assistantMessage);
        } else {
          resultConversation = {
            id: result.history_metadata.conversation_id,
            title: result.history_metadata.title,
            messages: [userMessage],
            date: result.history_metadata.date,
          };
          isEmpty(toolMessage)
            ? resultConversation.messages.push(assistantMessage)
            : resultConversation.messages.push(toolMessage, assistantMessage);
        }
        if (!resultConversation) {
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(
            (a) => a !== abortController
          );
          return;
        }
        appStateContext?.dispatch({
          type: "UPDATE_CURRENT_CHAT",
          payload: resultConversation,
        });
        isEmpty(toolMessage)
          ? setMessages([...messages, assistantMessage])
          : setMessages([...messages, toolMessage, assistantMessage]);
      }
    } catch (e) {
      if (!abortController.signal.aborted) {
        let errorMessage = `An error occurred. ${errorResponseMessage}`;
        if (result.error?.message) {
          errorMessage = result.error.message;
        } else if (typeof result.error === "string") {
          errorMessage = result.error;
        }
        let errorChatMsg: ChatMessage = {
          id: uuid(),
          role: ERROR,
          content: errorMessage,
          date: new Date().toISOString(),
        };
        let resultConversation;
        if (conversationId) {
          resultConversation = appStateContext?.state?.chatHistory?.find(
            (conv) => conv.id === conversationId
          );
          if (!resultConversation) {
            console.error("Conversation not found.");
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(
              (a) => a !== abortController
            );
            return;
          }
          resultConversation.messages.push(errorChatMsg);
        } else {
          if (!result.history_metadata) {
            console.error("Error retrieving data.", result);
            let errorChatMsg: ChatMessage = {
              id: uuid(),
              role: ERROR,
              content: errorMessage,
              date: new Date().toISOString(),
            };
            setMessages([...messages, userMessage, errorChatMsg]);
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(
              (a) => a !== abortController
            );
            return;
          }
          resultConversation = {
            id: result.history_metadata.conversation_id,
            title: result.history_metadata.title,
            messages: [userMessage],
            date: result.history_metadata.date,
          };
          resultConversation.messages.push(errorChatMsg);
        }
        if (!resultConversation) {
          setIsLoading(false);
          setShowLoadingMessage(false);
          abortFuncs.current = abortFuncs.current.filter(
            (a) => a !== abortController
          );
          return;
        }
        appStateContext?.dispatch({
          type: "UPDATE_CURRENT_CHAT",
          payload: resultConversation,
        });
        setMessages([...messages, errorChatMsg]);
      } else {
        setMessages([...messages, userMessage]);
      }
    } finally {
      setIsLoading(false);
      setShowLoadingMessage(false);
      abortFuncs.current = abortFuncs.current.filter(
        (a) => a !== abortController
      );
      setProcessMessages(messageStatus.Done);
    }
    return abortController.abort();
  };

  const clearChat = async () => {
    setClearingChat(true);
    if (
      appStateContext?.state.currentChat?.id &&
      appStateContext?.state.isCosmosDBAvailable.cosmosDB
    ) {
      let response = await historyClear(appStateContext?.state.currentChat.id);
      if (!response.ok) {
        setErrorMsg({
          title: "Error clearing current chat",
          subtitle:
            "Please try again. If the problem persists, please contact the site administrator.",
        });
        setHideErrorDialog(false);
      } else {
        appStateContext?.dispatch({
          type: "DELETE_CURRENT_CHAT_MESSAGES",
          payload: appStateContext?.state.currentChat.id,
        });
        appStateContext?.dispatch({
          type: "UPDATE_CHAT_HISTORY",
          payload: appStateContext?.state.currentChat,
        });
        setActiveCitation(undefined);
        setIsCitationPanelOpen(false);
        setMessages([]);
      }
    }
    setClearingChat(false);
  };

  const newChat = () => {
    setProcessMessages(messageStatus.Processing);
    setMessages([]);
    setIsCitationPanelOpen(false);
    setActiveCitation(undefined);
    appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: null });
    setProcessMessages(messageStatus.Done);
  };

  const stopGenerating = () => {
    abortFuncs.current.forEach((a) => a.abort());
    setShowLoadingMessage(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (appStateContext?.state.currentChat) {
      setMessages(appStateContext.state.currentChat.messages);
    } else {
      setMessages([]);
    }
  }, [appStateContext?.state.currentChat]);

  useLayoutEffect(() => {
    const saveToDB = async (messages: ChatMessage[], id: string) => {
      const response = await historyUpdate(messages, id);
      return response;
    };

    if (
      appStateContext &&
      appStateContext.state.currentChat &&
      processMessages === messageStatus.Done
    ) {
      if (appStateContext.state.isCosmosDBAvailable.cosmosDB) {
        if (!appStateContext?.state.currentChat?.messages) {
          console.error("Failure fetching current chat state.");
          return;
        }
        saveToDB(
          appStateContext.state.currentChat.messages,
          appStateContext.state.currentChat.id
        )
          .then((res) => {
            if (!res.ok) {
              let errorMessage =
                "An error occurred. Answers can't be saved at this time. If the problem persists, please contact the site administrator.";
              let errorChatMsg: ChatMessage = {
                id: uuid(),
                role: ERROR,
                content: errorMessage,
                date: new Date().toISOString(),
              };
              if (!appStateContext?.state.currentChat?.messages) {
                let err: Error = {
                  ...new Error(),
                  message: "Failure fetching current chat state.",
                };
                throw err;
              }
              setMessages([
                ...appStateContext?.state.currentChat?.messages,
                errorChatMsg,
              ]);
            }
            return res as Response;
          })
          .catch((err) => {
            console.error("Error: ", err);
            let errRes: Response = {
              ...new Response(),
              ok: false,
              status: 500,
            };
            return errRes;
          });
      } else {
      }
      appStateContext?.dispatch({
        type: "UPDATE_CHAT_HISTORY",
        payload: appStateContext.state.currentChat,
      });
      setMessages(appStateContext.state.currentChat.messages);
      setProcessMessages(messageStatus.NotRunning);
    }
  }, [processMessages]);

  useLayoutEffect(() => {
    chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [showLoadingMessage, processMessages]);

  const onShowCitation = (citation: Citation) => {
    setActiveCitation(citation);
    setIsCitationPanelOpen(true);
  };

  const onViewSource = (citation: Citation) => {
    if (citation.url && !citation.url.includes("blob.core")) {
      window.open(citation.url, "_blank");
    }
  };

  const parseCitationFromMessage = (message: ChatMessage) => {
    if (message?.role && message?.role === "tool") {
      try {
        const toolMessage = JSON.parse(message.content) as ToolMessageContent;
        return toolMessage.citations;
      } catch {
        return [];
      }
    }
    return [];
  };

  const disabledButton = () => {
    return (
      isLoading ||
      (messages && messages.length === 0) ||
      clearingChat ||
      appStateContext?.state.chatHistoryLoadingState ===
        ChatHistoryLoadingState.Loading
    );
  };

  const userLoaded = appStateContext?.state.userLoaded;

  return (
    <div className={styles.container} role="main">
      {userLoaded && !user_id ? (
        <Home />
      ) : (
        user_id && (
          <Stack horizontal className={styles.chatRoot}>
            <CheckChatHistory />
            <div className={styles.chatContainer}>
              {!messages || messages.length < 1 ? (
                <Stack className={styles.chatEmptyState}>
                  <Splash headlineText={"Fire Away!"} />
                </Stack>
              ) : (
                <div
                  className={styles.chatMessageStream}
                  style={{ marginBottom: isLoading ? "40px" : "0px" }}
                  role="log"
                >
                  {messages.map((answer, index) => (
                    <div key={answer.id}>
                      {answer.role === "user" ? (
                        <div className={styles.chatMessageUser} tabIndex={0}>
                          <div className={styles.chatMessageUserMessage}>
                            {answer.content}
                          </div>
                        </div>
                      ) : answer.role === "assistant" ? (
                        <div className={styles.chatMessageGpt}>
                          <Answer
                            answer={{
                              answer: answer.content,
                              citations: parseCitationFromMessage(
                                messages[index - 1]
                              ),
                              message_id: answer.id,
                              feedback: answer.feedback,
                            }}
                            onCitationClicked={(c) => onShowCitation(c)}
                          />
                        </div>
                      ) : answer.role === ERROR ? (
                        <div className={styles.chatMessageError}>
                          <Stack
                            horizontal
                            className={styles.chatMessageErrorContent}
                          >
                            <ErrorCircleRegular
                              className={styles.errorIcon}
                              style={{ color: "rgba(182, 52, 67, 1)" }}
                            />
                            <span>Error</span>
                          </Stack>
                          <span className={styles.chatMessageErrorContent}>
                            {answer.content}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {showLoadingMessage && (
                    <>
                      <div className={styles.chatMessageGpt}>
                        <Answer
                          answer={{
                            answer: "Generating answer...",
                            citations: [],
                          }}
                          onCitationClicked={() => null}
                        />
                      </div>
                    </>
                  )}
                  <div ref={chatMessageStreamEnd} />
                </div>
              )}

              <Stack horizontal className={styles.chatInput}>
                {isLoading && (
                  <div className={styles.stopGeneratingContainer}>
                    <Button
                      aria-label="Stop generating"
                      tabIndex={0}
                      onClick={stopGenerating}
                      onKeyDown={(e) =>
                        e.key === "Enter" || e.key === " "
                          ? stopGenerating()
                          : null
                      }
                      icon={<SquareRegular />}
                      size="small"
                    >
                      Stop generating
                    </Button>
                  </div>
                )}
                <div>
                  {appStateContext?.state.isCosmosDBAvailable?.status !==
                    CosmosDBStatus.NotConfigured && (
                    <Button
                      className={styles.newChatIcon}
                      icon={<Add48Regular />}
                      onClick={newChat}
                      disabled={disabledButton()}
                      aria-label="start a new chat button"
                    />
                  )}
                  <Dialog>
                    <DialogTrigger disableButtonEnhancement>
                      <Button
                        className={
                          appStateContext?.state.isCosmosDBAvailable?.status !==
                          CosmosDBStatus.NotConfigured
                            ? styles.clearChatBroom
                            : styles.clearChatBroomNoCosmos
                        }
                        icon={<BroomRegular />}
                        disabled={disabledButton()}
                        aria-label="clear chat button"
                      />
                    </DialogTrigger>
                    <DialogSurface
                      {...modalProps}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "end",
                        flexFlow: "row wrap",
                        gap: "8px",
                      }}
                    >
                      <DialogTitle
                        style={{
                          flex: "1 0 100%",
                        }}
                      >
                        Are you sure you want clear this chat?
                      </DialogTitle>
                      <DialogContent>
                        <DialogBody>
                          <Text>
                            The contents of this chat session will permanently
                            cleared.
                          </Text>
                        </DialogBody>
                      </DialogContent>
                      <DialogFooter>
                        <DialogTrigger disableButtonEnhancement>
                          <Button
                            icon={<DeleteIcon />}
                            onClick={
                              appStateContext?.state.isCosmosDBAvailable
                                ?.status !== CosmosDBStatus.NotConfigured
                                ? clearChat
                                : newChat
                            }
                          >
                            Clear Chat
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger disableButtonEnhancement>
                          <Button icon={<ExitIcon />}>Cancel</Button>
                        </DialogTrigger>
                      </DialogFooter>
                    </DialogSurface>
                  </Dialog>
                  <Dialog modalType="alert" open={!hideErrorDialog}>
                    <DialogSurface {...modalProps}>
                      <DialogTitle>{errorDialogContentProps.title}</DialogTitle>
                      <DialogContent>
                        <DialogBody>
                          {errorDialogContentProps.subText}
                        </DialogBody>
                      </DialogContent>
                      <DialogTrigger disableButtonEnhancement>
                        <Button onClick={handleErrorDialogClose}>Close</Button>
                      </DialogTrigger>
                    </DialogSurface>
                  </Dialog>
                </div>
                <QuestionInput
                  clearOnSend
                  placeholder="Type a new question..."
                  disabled={isLoading}
                  onSend={(question, id) => {
                    appStateContext?.state.isCosmosDBAvailable?.cosmosDB
                      ? makeApiRequestWithCosmosDB(question, id)
                      : makeApiRequestWithoutCosmosDB(question, id);
                  }}
                  conversationId={
                    appStateContext?.state.currentChat?.id
                      ? appStateContext?.state.currentChat?.id
                      : undefined
                  }
                />
              </Stack>
            </div>
            {/* Citation Panel */}
            {messages &&
              messages.length > 0 &&
              isCitationPanelOpen &&
              activeCitation && (
                <Stack.Item
                  className={styles.citationPanel}
                  tabIndex={0}
                  role="tabpanel"
                  aria-label="Citations Panel"
                >
                  <Stack
                    aria-label="Citations Panel Header Container"
                    horizontal
                    className={styles.citationPanelHeaderContainer}
                    horizontalAlign="space-between"
                    verticalAlign="center"
                  >
                    <span
                      aria-label="Citations"
                      className={styles.citationPanelHeader}
                    >
                      Citations
                    </span>
                    <Button
                      icon={<StopRegular />}
                      aria-label="Close citations panel"
                      onClick={() => setIsCitationPanelOpen(false)}
                    />
                  </Stack>
                  <h5
                    className={styles.citationPanelTitle}
                    tabIndex={0}
                    title={
                      activeCitation.url &&
                      !activeCitation.url.includes("blob.core")
                        ? activeCitation.url
                        : activeCitation.title ?? ""
                    }
                    onClick={() => onViewSource(activeCitation)}
                  >
                    {activeCitation.title}
                  </h5>
                  <div tabIndex={0}>
                    <ReactMarkdown
                      linkTarget="_blank"
                      className={styles.citationPanelContent}
                      children={DOMPurify.sanitize(activeCitation.content, {
                        ALLOWED_TAGS: XSSAllowTags,
                      })}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    />
                  </div>
                </Stack.Item>
              )}
            {appStateContext?.state.isChatHistoryOpen &&
              appStateContext?.state.isCosmosDBAvailable?.status !==
                CosmosDBStatus.NotConfigured && <ChatHistoryPanel />}
          </Stack>
        )
      )}
    </div>
  );
};

export default Chat;
