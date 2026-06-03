export const signalTrackerProtectedDemoTopicId =
  "3c3f7086-e40b-4320-a62f-24dd95b4c04d";

const signalTrackerProtectedDemoTopicIds = [
  signalTrackerProtectedDemoTopicId
] as const;

export function isSignalTrackerProtectedDemoTopicId(topicId: string): boolean {
  return signalTrackerProtectedDemoTopicIds.includes(
    topicId as (typeof signalTrackerProtectedDemoTopicIds)[number]
  );
}
