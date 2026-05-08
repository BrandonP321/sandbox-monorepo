import { createContext, type ReactNode } from "react";
import type { Topic } from "@repo/signal-tracker-shared";

type TopicSettingsModalContextValue = {
  topic: Topic;
  topicId: string;
};

const TopicSettingsModalContext =
  createContext<TopicSettingsModalContextValue | null>(null);

type TopicSettingsModalProviderProps = {
  children: ReactNode;
  topic: Topic;
};

function TopicSettingsModalProvider({
  children,
  topic
}: TopicSettingsModalProviderProps) {
  return (
    <TopicSettingsModalContext.Provider value={{ topic, topicId: topic.id }}>
      {children}
    </TopicSettingsModalContext.Provider>
  );
}

export {
  TopicSettingsModalProvider,
  TopicSettingsModalContext,
  type TopicSettingsModalContextValue
};
