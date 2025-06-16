export const getItem = key => {
  try {
    return localStorage?.getItem(key);
  } catch (e) {
    return null;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage?.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
};
