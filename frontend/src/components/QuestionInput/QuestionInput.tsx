import { ChangeEvent, useState } from "react";
import { Stack } from "@fluentui/react";
import {
  Button,
  Textarea,
  TextareaOnChangeData,
} from "@fluentui/react-components";
import { Send48Filled } from "@fluentui/react-icons";
import styles from "./QuestionInput.module.css";

interface Props {
  onSend: (question: string, id?: string) => void;
  disabled: boolean;
  placeholder?: string;
  clearOnSend?: boolean;
  conversationId?: string;
}

export const QuestionInput = ({
  onSend,
  disabled,
  placeholder,
  clearOnSend,
  conversationId,
}: Props) => {
  const [question, setQuestion] = useState<string>("");

  const sendQuestion = () => {
    if (disabled || !question.trim()) {
      return;
    }

    if (conversationId) {
      onSend(question, conversationId);
    } else {
      onSend(question);
    }

    if (clearOnSend) {
      setQuestion("");
    }
  };

  const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
    if (
      ev.key === "Enter" &&
      !ev.shiftKey &&
      !(ev.nativeEvent?.isComposing === true)
    ) {
      ev.preventDefault();
      sendQuestion();
    }
  };

  const onQuestionChange = (
    _ev: ChangeEvent<HTMLTextAreaElement>,
    newValue: TextareaOnChangeData
  ) => {
    setQuestion(newValue.value || "");
  };

  const sendQuestionDisabled = disabled || !question.trim();

  return (
    <Stack horizontal className={styles.questionInputContainer}>
      <Textarea
        className={styles.questionInputTextArea}
        placeholder={placeholder}
        value={question}
        onChange={onQuestionChange}
        onKeyDown={onEnterPress}
        autoFocus
      />
      <Button
        className={styles.questionInputSendButtonContainer}
        role="button"
        tabIndex={0}
        aria-label="Ask question button"
        onClick={sendQuestion}
        onKeyDown={(e) =>
          e.key === "Enter" || e.key === " " ? sendQuestion() : null
        }
        icon={<Send48Filled />}
        disabled={sendQuestionDisabled}
      />
      <div className={styles.questionInputBottomBorder} />
    </Stack>
  );
};
