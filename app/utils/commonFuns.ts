export const isBrowser = (): boolean => {
  return typeof window !== "undefined";
};

export const nextLocalStorage = (): Storage | void => {
  if (isBrowser()) {
    return window.localStorage;
  }
};

export const capitalizeF = (str: any) => {
  if (str?.length === 0) return str;
  return str?.charAt(0)?.toUpperCase() + str?.slice(1);
};

export const transformString = (str: String) => {
  if (str?.length === 0) return str;

  let transformedStr = str?.charAt(0)?.toLowerCase() + str?.slice(1);

  return transformedStr;
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  // Extract only the first 5 characters (HH:mm) to remove the seconds
  return time?.slice(0, 5);
};