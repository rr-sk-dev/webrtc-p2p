export const getElementById = <T>(id: string) => {
  return document.getElementById(id) as T;
};

export const getElementsByTagName = <T>(name: string) => {
  return document.getElementsByTagName(name)[0] as T;
};

export const showElement = (element: HTMLElement) => {
  element.style.display = "block";
};

export const hideElement = (element: HTMLElement) => {
  element.style.display = "none";
};
