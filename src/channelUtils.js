const SUBSCRIPTIONS_KEY = "subscriptions";

export const getSubscriptions = () => {
  const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const isSubscribed = (channelId) => {
  const subs = getSubscriptions();
  return subs.some((item) => item.channelId === channelId);
};

export const subscribeToChannel = (channel) => {
  const subs = getSubscriptions();
  if (subs.some((item) => item.channelId === channel.channelId)) return;
  const updated = [...subs, channel];
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
};

export const unsubscribeFromChannel = (channelId) => {
  const subs = getSubscriptions();
  const updated = subs.filter((item) => item.channelId !== channelId);
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
};