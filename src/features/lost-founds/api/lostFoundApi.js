import { apiFetch } from "../../../helpers/apiHelper";

export function getLostFounds({ status, isCompleted, isMe } = {}) {
  return apiFetch("/lost-founds", {
    query: { status, is_completed: isCompleted, is_me: isMe },
  });
}

export function getLostFoundById(id) {
  return apiFetch(`/lost-founds/${id}`);
}

export function postLostFound({ title, description, status }) {
  return apiFetch("/lost-founds", { method: "POST", body: { title, description, status } });
}

export function putLostFound(id, { title, description, status, isCompleted }) {
  return apiFetch(`/lost-founds/${id}`, {
    method: "PUT",
    body: { title, description, status, is_completed: isCompleted ? 1 : 0 },
  });
}

export function postLostFoundCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);
  return apiFetch(`/lost-founds/${id}/cover`, { method: "POST", formData });
}

export function deleteLostFound(id) {
  return apiFetch(`/lost-founds/${id}`, { method: "DELETE" });
}

export function getLostFoundStatsDaily() {
  return apiFetch("/lost-founds/stats/daily");
}

export function getLostFoundStatsMonthly() {
  return apiFetch("/lost-founds/stats/monthly");
}
