import React, { createContext, useReducer, ReactNode, useEffect } from "react";
import { appStateReducer } from "./AppReducer";
import {
  Conversation,
  ChatHistoryLoadingState,
  CosmosDBHealth,
  historyList,
  historyEnsure,
  CosmosDBStatus,
  frontendSettings,
  FrontendSettings,
  Feedback,
} from "../api";

export interface AppState {
  isChatHistoryOpen: boolean;
  chatHistoryLoadingState: ChatHistoryLoadingState;
  isCosmosDBAvailable: CosmosDBHealth;
  chatHistory: Conversation[] | null;
  filteredChatHistory: Conversation[] | null;
  currentChat: Conversation | null;
  frontendSettings: FrontendSettings | null;
  feedbackState: {
    [answerId: string]:
      | Feedback.Neutral
      | Feedback.Positive
      | Feedback.Negative;
  };
  userId: string | null;
  userLoaded: boolean;
}

export type Action =
  | { type: "SET_USER_LOADED"; payload: boolean }
  | { type: "SET_USER_ID"; payload: string | null }
  | { type: "TOGGLE_CHAT_HISTORY" }
  | { type: "SET_COSMOSDB_STATUS"; payload: CosmosDBHealth }
  | {
      type: "UPDATE_CHAT_HISTORY_LOADING_STATE";
      payload: ChatHistoryLoadingState;
    }
  | { type: "UPDATE_CURRENT_CHAT"; payload: Conversation | null }
  | { type: "UPDATE_FILTERED_CHAT_HISTORY"; payload: Conversation[] | null }
  | { type: "UPDATE_CHAT_HISTORY"; payload: Conversation } // API Call
  | { type: "UPDATE_CHAT_TITLE"; payload: Conversation } // API Call
  | { type: "DELETE_CHAT_ENTRY"; payload: string } // API Call
  | { type: "DELETE_CHAT_HISTORY" } // API Call
  | { type: "DELETE_CURRENT_CHAT_MESSAGES"; payload: string } // API Call
  | { type: "FETCH_CHAT_HISTORY"; payload: Conversation[] | null } // API Call
  | { type: "FETCH_FRONTEND_SETTINGS"; payload: FrontendSettings | null } // API Call
  | {
      type: "SET_FEEDBACK_STATE";
      payload: {
        answerId: string;
        feedback: Feedback.Positive | Feedback.Negative | Feedback.Neutral;
      };
    }
  | { type: "GET_FEEDBACK_STATE"; payload: string };

const initialState: AppState = {
  isChatHistoryOpen: false,
  chatHistoryLoadingState: ChatHistoryLoadingState.Loading,
  chatHistory: null,
  filteredChatHistory: null,
  currentChat: null,
  isCosmosDBAvailable: {
    cosmosDB: false,
    status: CosmosDBStatus.NotConfigured,
  },
  frontendSettings: null,
  feedbackState: {},
  userId: null,
  userLoaded: false,
};

export const AppStateContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

type AppStateProviderProps = {
  children: ReactNode;
};

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  useEffect(() => {
    const getFrontendSettings = async () => {
      frontendSettings()
        .then((response) => {
          dispatch({
            type: "FETCH_FRONTEND_SETTINGS",
            payload: response as FrontendSettings,
          });
        })
        .catch((err) => {
          console.error("There was an issue fetching your data.");
        });
    };
    getFrontendSettings();
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};
