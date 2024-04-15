import { useContext, useEffect } from "react";
import {
  ChatHistoryLoadingState,
  Conversation,
  CosmosDBStatus,
  historyEnsure,
  historyList,
} from "../../api";
import { AppStateContext } from "../../state/AppProvider";

export const CheckChatHistory = () => {
  const appStateContext = useContext(AppStateContext);
  const dispatch = appStateContext?.dispatch || (() => {});

  useEffect(() => {
    // Check for cosmosdb config and fetch initial data here
    const fetchChatHistory = async (
      offset = 0
    ): Promise<Conversation[] | null> => {
      const result = await historyList(offset)
        .then((response) => {
          if (response) {
            dispatch({ type: "FETCH_CHAT_HISTORY", payload: response });
          } else {
            dispatch({ type: "FETCH_CHAT_HISTORY", payload: null });
          }
          return response;
        })
        .catch((err) => {
          dispatch({
            type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
            payload: ChatHistoryLoadingState.Fail,
          });
          dispatch({ type: "FETCH_CHAT_HISTORY", payload: null });
          console.error("There was an issue fetching your data.");
          return null;
        });
      return result;
    };

    const getHistoryEnsure = async () => {
      dispatch({
        type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
        payload: ChatHistoryLoadingState.Loading,
      });
      historyEnsure()
        .then((response) => {
          if (response?.cosmosDB) {
            fetchChatHistory()
              .then((res) => {
                if (res) {
                  dispatch({
                    type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
                    payload: ChatHistoryLoadingState.Success,
                  });
                  dispatch({
                    type: "SET_COSMOSDB_STATUS",
                    payload: response,
                  });
                } else {
                  dispatch({
                    type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
                    payload: ChatHistoryLoadingState.Fail,
                  });
                  dispatch({
                    type: "SET_COSMOSDB_STATUS",
                    payload: {
                      cosmosDB: false,
                      status: CosmosDBStatus.NotWorking,
                    },
                  });
                }
              })
              .catch((err) => {
                dispatch({
                  type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
                  payload: ChatHistoryLoadingState.Fail,
                });
                dispatch({
                  type: "SET_COSMOSDB_STATUS",
                  payload: {
                    cosmosDB: false,
                    status: CosmosDBStatus.NotWorking,
                  },
                });
              });
          } else {
            dispatch({
              type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
              payload: ChatHistoryLoadingState.Fail,
            });
            dispatch({ type: "SET_COSMOSDB_STATUS", payload: response });
          }
        })
        .catch((err) => {
          dispatch({
            type: "UPDATE_CHAT_HISTORY_LOADING_STATE",
            payload: ChatHistoryLoadingState.Fail,
          });
          dispatch({
            type: "SET_COSMOSDB_STATUS",
            payload: {
              cosmosDB: false,
              status: CosmosDBStatus.NotConfigured,
            },
          });
        });
    };
    getHistoryEnsure();
  }, []);

  return <></>;
};
