import * as React from "react";
import { List, Separator, Spinner, SpinnerSize } from "@fluentui/react";
import {
  Text,
  Input,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
} from "@fluentui/react-components";
import {
  Delete16Regular as DeleteIcon,
  Edit16Regular as EditIcon,
  ArrowExitFilled as ExitIcon,
} from "@fluentui/react-icons";
import { CancelIcon, CheckMarkIcon } from "@fluentui/react-icons-mdl2";

import { AppStateContext } from "../../state/AppProvider";
import { GroupedChatHistory } from "./ChatHistoryList";

import styles from "./ChatHistoryPanel.module.css";
import { Conversation } from "../../api/models";
import { historyDelete, historyRename, historyList } from "../../api";
import { useEffect, useRef, useState, useContext } from "react";

interface ChatHistoryListItemCellProps {
  item?: Conversation;
  onSelect: (item: Conversation | null) => void;
}

interface ChatHistoryListItemGroupsProps {
  groupedChatHistory: GroupedChatHistory[];
}

const formatMonth = (month: string) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const [monthName, yearString] = month.split(" ");
  const year = parseInt(yearString);

  if (year === currentYear) {
    return monthName;
  } else {
    return month;
  }
};

export const ChatHistoryListItemCell: React.FC<
  ChatHistoryListItemCellProps
> = ({ item, onSelect }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [edit, setEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [errorDelete, setErrorDelete] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [errorRename, setErrorRename] = useState<string | undefined>(undefined);
  const [textFieldFocused, setTextFieldFocused] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const appStateContext = React.useContext(AppStateContext);
  const isSelected = item?.id === appStateContext?.state.currentChat?.id;

  const modalProps = {
    titleAriaId: "labelId",
    subtitleAriaId: "subTextId",
    isBlocking: true,
    styles: { main: { maxWidth: 450 } },
  };

  if (!item) {
    return null;
  }

  useEffect(() => {
    if (textFieldFocused && textFieldRef.current) {
      textFieldRef.current.focus();
      setTextFieldFocused(false);
    }
  }, [textFieldFocused]);

  useEffect(() => {
    if (appStateContext?.state.currentChat?.id !== item?.id) {
      setEdit(false);
      setEditTitle("");
    }
  }, [appStateContext?.state.currentChat?.id, item?.id]);

  const onDelete = async () => {
    let response = await historyDelete(item.id);
    if (!response.ok) {
      setErrorDelete(true);
      setTimeout(() => {
        setErrorDelete(false);
      }, 5000);
    } else {
      appStateContext?.dispatch({
        type: "DELETE_CHAT_ENTRY",
        payload: item.id,
      });
    }
  };

  const onEdit = () => {
    setEdit(true);
    setTextFieldFocused(true);
    setEditTitle(item?.title);
  };

  const handleSelectItem = () => {
    onSelect(item);
    appStateContext?.dispatch({ type: "UPDATE_CURRENT_CHAT", payload: item });
  };

  const truncatedTitle =
    item?.title?.length > 28
      ? `${item.title.substring(0, 28)} ...`
      : item.title;

  const handleSaveEdit = async (e: any) => {
    e.preventDefault();
    if (errorRename || renameLoading) {
      return;
    }
    if (editTitle == item.title) {
      setErrorRename("Error: Enter a new title to proceed.");
      setTimeout(() => {
        setErrorRename(undefined);
        setTextFieldFocused(true);
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 5000);
      return;
    }
    setRenameLoading(true);
    let response = await historyRename(item.id, editTitle);
    if (!response.ok) {
      setErrorRename("Error: could not rename item");
      setTimeout(() => {
        setTextFieldFocused(true);
        setErrorRename(undefined);
        if (textFieldRef.current) {
          textFieldRef.current.focus();
        }
      }, 5000);
    } else {
      setRenameLoading(false);
      setEdit(false);
      appStateContext?.dispatch({
        type: "UPDATE_CHAT_TITLE",
        payload: { ...item, title: editTitle } as Conversation,
      });
      setEditTitle("");
    }
  };

  const chatHistoryTitleOnChange = (e: any) => {
    setEditTitle(e.target.value);
  };

  const cancelEditTitle = () => {
    setEdit(false);
    setEditTitle("");
  };

  const handleKeyPressEdit = (e: any) => {
    if (e.key === "Enter") {
      return handleSaveEdit(e);
    }
    if (e.key === "Escape") {
      cancelEditTitle();
      return;
    }
  };

  return (
    <div
      key={item.id}
      tabIndex={0}
      aria-label="chat history item"
      onClick={() => handleSelectItem()}
      onKeyDown={(e) =>
        e.key === "Enter" || e.key === " " ? handleSelectItem() : null
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isSelected ? '#3f3f3f' : 'transparent',
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        maxWidth: "270px",
        minHeight: "32px",
        cursor: "pointer",
        paddingLeft: "15px",
        paddingRight: "5px",
        paddingTop: "5px",
        paddingBottom: "5px",
        boxSizing: "border-box",
        borderRadius: "5px",
        background: "#3c3c3c"
      }}
    >
      {edit ? (
        <>
          <div style={{ 
            width: "100%",
            display: "flex",
            flexDirection: "row",
            }}>
            <form
              aria-label="edit title form"
              onSubmit={(e) => handleSaveEdit(e)}
              style={{ padding: "0px", margin: "0px", width: "100%"}}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "start",
                  width: "100%",
                }}
              >
                <Input
                  ref={textFieldRef}
                  autoFocus={textFieldFocused}
                  value={editTitle}
                  placeholder={item.title}
                  onChange={chatHistoryTitleOnChange}
                  onKeyDown={handleKeyPressEdit}
                  // errorMessage={errorRename}
                  disabled={errorRename ? true : false}
                  style={{ margin: "0px", padding: "0px", height: "12px"}}
                  appearance="underline"
                />
                {editTitle && (
                    <div
                      aria-label="action button group"
                      style={{ display: "flex", flexDirection: "row", justifyContent: "end", width: "100%"}}
                    >
                      <Button
                        disabled={errorRename !== undefined}
                        onKeyDown={(e) =>
                          e.key === " " || e.key === "Enter"
                            ? handleSaveEdit(e)
                            : null
                        }
                        onClick={(e) => handleSaveEdit(e)}
                        aria-label="confirm new title"
                        icon={<CheckMarkIcon/>}
                        size="small"
                      />
                      <Button
                        disabled={errorRename !== undefined}
                        onKeyDown={(e) =>
                          e.key === " " || e.key === "Enter"
                            ? cancelEditTitle()
                            : null
                        }
                        onClick={() => cancelEditTitle()}
                        aria-label="cancel edit title"
                        icon={<CancelIcon style={{width: "16px", height: "16px"}}/>}
                        size="small"
                      />
                    </div>
                )}
              </div>
              {errorRename && (
                <Text
                  role="alert"
                  aria-label={errorRename}
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "rgb(164,38,44)",
                  }}
                >
                  {errorRename}
                </Text>
              )}
            </form>
          </div>
        </>
      ) : (
        <>
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            gap: "1px"
            }}>
            <div className={styles.chatTitle} style={{ height: "24px" }}>
              {truncatedTitle}
            </div>
            {(isSelected || isHovered) && (
              <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "end"
              }}>
                <Dialog>
                  <DialogTrigger disableButtonEnhancement>
                    <Button icon={<DeleteIcon />} title="Delete" size="small" />
                  </DialogTrigger>
                  <DialogSurface {...modalProps}>
                    <DialogTitle>
                      Are you sure you want to delete this item?
                    </DialogTitle>
                    <DialogContent>
                      <DialogBody>
                        <Text>
                          The history of this chat session will permanently
                          removed.
                        </Text>
                      </DialogBody>
                    </DialogContent>
                    <DialogTrigger disableButtonEnhancement>
                      <Button icon={<DeleteIcon />} onClick={() => onDelete()}>
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger disableButtonEnhancement>
                      <Button icon={<ExitIcon />}>Cancel</Button>
                    </DialogTrigger>
                  </DialogSurface>
                </Dialog>
                <Button
                  icon={<EditIcon />}
                  size="small"
                  title="Edit"
                  onClick={onEdit}
                  onKeyDown={(e) => (e.key === " " ? onEdit() : null)}
                />
              </div>
            )}
          </div>
        </>
      )}
      {errorDelete && (
        <Text
          style={{
            color: "red", marginTop: 5, fontSize: 14
          }}
        >
          Error: could not delete item
        </Text>
      )}
    </div>
  );
};

export const ChatHistoryListItemGroups: React.FC<
  ChatHistoryListItemGroupsProps
> = ({ groupedChatHistory }) => {
  const appStateContext = useContext(AppStateContext);
  const observerTarget = useRef(null);
  const [, setSelectedItem] = React.useState<Conversation | null>(null);
  const [offset, setOffset] = useState<number>(25);
  const [observerCounter, setObserverCounter] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);
  const firstRender = useRef(true);

  const handleSelectHistory = (item?: Conversation) => {
    if (item) {
      setSelectedItem(item);
    }
  };

  const onRenderCell = (item?: Conversation) => {
    return (
      <ChatHistoryListItemCell
        item={item}
        onSelect={() => handleSelectHistory(item)}
      />
    );
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    handleFetchHistory();
    setOffset((offset) => (offset += 25));
  }, [observerCounter]);

  const handleFetchHistory = async () => {
    const currentChatHistory = appStateContext?.state.chatHistory;
    setShowSpinner(true);

    await historyList(offset).then((response) => {
      const concatenatedChatHistory =
        currentChatHistory &&
        response &&
        currentChatHistory.concat(...response);
      if (response) {
        appStateContext?.dispatch({
          type: "FETCH_CHAT_HISTORY",
          payload: concatenatedChatHistory || response,
        });
      } else {
        appStateContext?.dispatch({
          type: "FETCH_CHAT_HISTORY",
          payload: null,
        });
      }
      setShowSpinner(false);
      return response;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setObserverCounter((observerCounter) => (observerCounter += 1));
      },
      { threshold: 1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget]);

  return (
    <div className={styles.listContainer} data-is-scrollable>
      {groupedChatHistory.map(
        (group) =>
          group.entries.length > 0 && (
            <div
              key={group.month}
              className={styles.chatGroup}
              aria-label={`chat history group: ${group.month}`}
            >
              <div aria-label={group.month} className={styles.chatMonth}>
                {formatMonth(group.month)}
              </div>
              <List
                aria-label={`chat history list`}
                items={group.entries}
                onRenderCell={onRenderCell}
                className={styles.chatList}
              />
              <div ref={observerTarget} />
              <Separator
                styles={{
                  root: {
                    width: "100%",
                    position: "relative",
                    "::before": {
                      backgroundColor: "#d6d6d6",
                    },
                  },
                }}
              />
            </div>
          )
      )}
      {showSpinner && (
        <div className={styles.spinnerContainer}>
          <Spinner
            size={SpinnerSize.small}
            aria-label="loading more chat history"
            className={styles.spinner}
          />
        </div>
      )}
    </div>
  );
};
