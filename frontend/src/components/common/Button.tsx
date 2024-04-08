import { Button } from "@fluentui/react-components";
import { History20Regular as HistoryIcon, Share20Regular as ShareIcon } from "@fluentui/react-icons";

interface ButtonProps {
  onClick: () => void;
  text: string | undefined;
}

export const ShareButton: React.FC<ButtonProps> = ({ onClick, text }) => {

  return (
    <Button
      appearance="subtle"
      icon={<ShareIcon />}
      onClick={onClick}>{text}</Button>
  )
}

export const HistoryButton: React.FC<ButtonProps> = ({ onClick, text }) => {
  return (
    <Button
      appearance="subtle"
      icon={<HistoryIcon />}
      onClick={onClick}
      >{text}</Button>
  )
}