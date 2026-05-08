import { useContext } from "react";
import { TopicSettingsModalContext } from "../context/TopicSettingsModalContext";

function useTopicSettingsModalContext() {
  const context = useContext(TopicSettingsModalContext);

  if (!context) {
    throw new Error(
      "useTopicSettingsModalContext must be used within a TopicSettingsModalProvider"
    );
  }

  return context;
}

export { useTopicSettingsModalContext };
