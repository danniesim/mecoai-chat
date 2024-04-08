import { ContextualMenu, Dialog, DialogFooter, DialogType, IContextualMenuItem, IStackStyles, Spinner, SpinnerSize } from "@fluentui/react";
import { useBoolean } from '@fluentui/react-hooks';
import { Title3, Button, Text } from "@fluentui/react-components";
import { Broom24Regular as BroomIcon } from "@fluentui/react-icons";
import { ChromeCloseIcon as CloseIcon } from "@fluentui/react-icons-mdl2";

import styles from "./ChatHistoryPanel.module.css"
import { useContext } from "react";
import { AppStateContext } from "../../state/AppProvider";
import React from "react";
import ChatHistoryList from "./ChatHistoryList";
import { ChatHistoryLoadingState, historyDeleteAll } from "../../api";


interface ChatHistoryPanelProps {

}

export enum ChatHistoryPanelTabs {
    History = "History"
}

const commandBarButtonStyle: Partial<IStackStyles> = { root: { height: '50px' } };

export function ChatHistoryPanel(props: ChatHistoryPanelProps) {
    const appStateContext = useContext(AppStateContext)
    const [showContextualMenu, setShowContextualMenu] = React.useState(false);
    const [hideClearAllDialog, { toggle: toggleClearAllDialog }] = useBoolean(true);
    const [clearing, setClearing] = React.useState(false)
    const [clearingError, setClearingError] = React.useState(false)

    const clearAllDialogContentProps = {
        type: DialogType.close,
        title: !clearingError? 'Are you sure you want to clear all chat history?' : 'Error deleting all of chat history',
        closeButtonAriaLabel: 'Close',
        subText: !clearingError ? 'All chat history will be permanently removed.' : 'Please try again. If the problem persists, please contact the site administrator.',
    };
    
    const modalProps = {
        titleAriaId: 'labelId',
        subtitleAriaId: 'subTextId',
        isBlocking: true,
        styles: { main: { maxWidth: 450 } }
    }

    const menuItems: IContextualMenuItem[] = [
        { key: 'clearAll', text: 'Clear all chat history', iconProps: { iconName: 'Delete' }},
    ];

    const handleHistoryClick = () => {
        appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' })
    };
    
    const onShowContextualMenu = React.useCallback((ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault(); // don't navigate
        setShowContextualMenu(true);
    }, []);

    const onHideContextualMenu = React.useCallback(() => setShowContextualMenu(false), []);

    const onClearAllChatHistory = async () => {
        setClearing(true)
        let response = await historyDeleteAll()
        if(!response.ok){
            setClearingError(true)
        }else{
            appStateContext?.dispatch({ type: 'DELETE_CHAT_HISTORY' })
            toggleClearAllDialog();
        }
        setClearing(false);
    }

    const onHideClearAllDialog = () => {
        toggleClearAllDialog()
        setTimeout(() => {
            setClearingError(false)
        }, 2000);
    }

    React.useEffect(() => {}, [appStateContext?.state.chatHistory, clearingError]);

    return (
        <div style={{width: "268px", margin: "8px"}}data-is-scrollable aria-label={"chat history panel"}>
            <div style={{
              display: "flex",
              alignContent: "space-between",
              justifyContent: "center",
              flexGrow: "12",
              gap: "4px"
            }} aria-label="chat history header">
                <Title3 style={{flexGrow: "3"}}>Chat history</Title3>
                <div style={{display: "flex", justifyContent: "start"}}>
                    <div style={{display: "flex", flexDirection: "row", gap: "4px"}}>
                        <Button
                            icon={<BroomIcon  />}
                            title={"Clear all chat history"}
                            onClick={onShowContextualMenu}
                            aria-label={"clear all chat history"}
                            id="moreButton"
                        />
                        <ContextualMenu
                            items={menuItems}
                            hidden={!showContextualMenu}
                            target={"#moreButton"}
                            onItemClick={toggleClearAllDialog}
                            onDismiss={onHideContextualMenu}
                        />
                        <Button
                            icon={<CloseIcon style={{width: "16px", height: "16px"}}/>}
                            title={"Hide"}
                            onClick={handleHistoryClick}
                            aria-label={"hide button"}
                        />
                    </div>
                </div>
            </div>
            <div aria-label="chat history panel content"
                style={{
                    display: "flex",
                    flexGrow: 1,
                    flexDirection: "column",
                    flexWrap: "wrap",
                    padding: "1px"
                }}>
                <div className={styles.chatHistoryListContainer}>
                    {(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Success && appStateContext?.state.isCosmosDBAvailable.cosmosDB) && <ChatHistoryList/>}
                    {(appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Fail && appStateContext?.state.isCosmosDBAvailable) && <>
                        <div>
                            <div style={{
                              display: "flex",
                              alignContent: "center",
                              justifyContent: "center",
                              gap: "4px",
                              width: "100%", marginTop: 10 
                            }}>
                              <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 16 }}>
                                  {appStateContext?.state.isCosmosDBAvailable?.status && <span>{appStateContext?.state.isCosmosDBAvailable?.status}</span>}
                                  {!appStateContext?.state.isCosmosDBAvailable?.status && <span>Error loading chat history</span>}
                                  
                              </Text>
                              <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 14 }}>
                                  <span>Chat history can't be saved at this time</span>
                              </Text>
                            </div>
                        </div>
                    </>}
                    {appStateContext?.state.chatHistoryLoadingState === ChatHistoryLoadingState.Loading && <>
                        <div>
                            <div style={{ width: "100%",
                              alignContent: "center",
                              justifyContent: "center",
                              marginTop: 10 }}>
                                <Spinner style={{ alignSelf: "flex-start", height: "100%", marginRight: "5px" }} size={SpinnerSize.medium} />
                                <Text style={{ alignSelf: 'center', fontWeight: '400', fontSize: 14 }}>
                                    <span style={{ whiteSpace: 'pre-wrap' }}>Loading chat history</span>
                                </Text>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
            <Dialog
                hidden={hideClearAllDialog}
                onDismiss={clearing ? ()=>{} : onHideClearAllDialog}
                dialogContentProps={clearAllDialogContentProps}
                modalProps={modalProps}
            >
                <DialogFooter>
                {!clearingError && <Button onClick={onClearAllChatHistory} disabled={clearing}>Clear All</Button>}
                <Button onClick={onHideClearAllDialog} disabled={clearing}>{!clearingError ? "Cancel" : "Close"}</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}