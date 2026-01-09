// FILE: src/data/notificationsData.js
import nilu from "../assets/profiles/nilu.jpg";
import amit from "../assets/profiles/amit.jpg";
import anjali from "../assets/profiles/anjali.jpg";

export const notificationsData = [
  {
    id: "n1",
    from: { name: "Amit Kumar", avatar: amit },
    text: "Amit answered your question 'How does React re-render components?' — check it out.",
    createdAt: "2025-10-05T09:20:00Z",
    unread: true,
    type: "answer",
  },
  {
    id: "n2",
    from: { name: "Anjali Mehta", avatar: anjali },
    text:
      "Anjali commented on your post: “Nice explanation — can you show an example with hooks?”",
    createdAt: "2025-10-04T14:10:00Z",
    unread: true,
    type: "comment",
  },
  {
    id: "n3",
    from: { name: "Quora Clone", avatar: nilu },
    text: "Welcome! Get started by following some spaces and asking your first question.",
    createdAt: "2025-09-30T08:00:00Z",
    unread: false,
    type: "system",
  },
  {
    id: "n4",
    from: { name: "Design & UX", avatar: nilu },
    text:
      "New discussion in Design & UX: ‘Microinteractions that delight’ — join the conversation.",
    createdAt: "2025-09-29T11:45:00Z",
    unread: false,
    type: "space",
  },
  {
    id: "n5",
    from: { name: "Sara Patel", avatar: nilu },
    text:
      "Sara mentioned you in a comment: “@you take a look at this resource — it helped me.”",
    createdAt: "2025-09-28T19:02:00Z",
    unread: false,
    type: "mention",
  },
];
