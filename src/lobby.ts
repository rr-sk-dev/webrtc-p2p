import "./lobby.css";

const form = document.getElementById("join-form") as HTMLFormElement;

form.addEventListener("submit", (ev: SubmitEvent | any) => {
  ev.preventDefault();

  const inviteCode = ev.target.invite_link.value;

  window.location.href = `index.html?room=${inviteCode}`;
});
