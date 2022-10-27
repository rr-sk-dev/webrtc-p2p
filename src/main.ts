import "./style.css";
import { getElementById } from "./utils/view.utils";

/** :::::::::::: Home/Lobby :::::::::::: **/

const form = getElementById<HTMLFormElement>("room-form");

/** Listen for form submission **/
form.addEventListener("submit", (ev: SubmitEvent | any) => {
  ev.preventDefault();

  const inviteCode = ev.target.invite_link.value;

  window.location.href = `./src/room/room.html?room=${inviteCode}`;
});
