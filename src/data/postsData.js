import ans1 from "../assets/answers/Ans 1.jpeg";
import ans2 from "../assets/answers/ans 2.jpg";
import amit from "../assets/profiles/amit.jpg";
import anjali from "../assets/profiles/anjali.jpg";

export const postsData = [
  {
    id: "p1",
    type: "question",
    title: "What are the best ways to learn React?",
    content: "Start with the official docs, build small apps, and learn hooks deeply.",
    image: ans1,
    author: { name: "Amit Kumar", avatar: amit, profession: "Frontend Developer" },
    createdAt: "2025-10-01T08:00:00Z",
    upvotes: 45,
    downvotes: 3,
    comments: 0,
    followed: false,
    font: "inherit",
  },
  {
    id: "p2",
    type: "post",
    content: "React 19 is amazing! The new useOptimistic hook simplifies async UI updates.",
    image: ans2,
    author: { name: "Anjali Mehta", avatar: anjali, profession: "Software Engineer" },
    createdAt: "2025-09-30T15:00:00Z",
    upvotes: 32,
    downvotes: 2,
    comments: 0,
    followed: true,
    font: "Arial, sans-serif",
  },
  // Add 3–4 more posts...
];
