# LearnSphere: Your Gamified Gateway to Web3

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:internetcomputer](https://img.shields.io/badge/internetcomputer-3D8BD3)

**LearnSphere** is a "learn-to-earn" decentralized application (dApp) designed to make education in Web3 accessible, engaging, and rewarding. It transforms the complex world of blockchain, the Internet Computer Protocol (ICP), and AI agents into a gamified adventure where users complete quests, earn rewards, and level up their skills.

---

## The Problem

The world of Web3 is expanding rapidly, but for newcomers, it presents a steep and fragmented learning curve. Aspiring developers and enthusiasts often face a scattered landscape of complex information, creating a significant barrier to entry that can be discouraging. Without a clear starting point or structured path, motivation quickly wanes.

**LearnSphere** solves this by providing a curated, incentive-driven educational platform, complete with an AI-powered assistant to guide users on their journey.

---

## ✨ Features

- **Gamified Learning Quests**: A structured curriculum of quests covering foundational topics like Web3, ICP, Fetch.ai, DeFi, and more.
- **Learn-to-Earn Model**: Users are rewarded with tokens and experience points for completing quests, creating a powerful incentive to stay engaged.
- **On-Chain Progress**: All user stats, including completed quests and rewards, are stored on the Internet Computer blockchain, ensuring transparency and ownership.
- **AI-Powered Chat Assistant**: An integrated chatbot, built with Fetch.ai uAgents, acts as a personal tutor, offering instant support and guidance.
- **Interactive Frontend**: A sleek and responsive user interface built with React and Tailwind CSS provides a seamless user experience.
- **Decentralized Backend**: The entire application logic is hosted on-chain through Motoko smart contracts on the Internet Computer.

---

## 🛠️ Tech Stack

This project is a full-stack dApp combining a decentralized backend with a modern web frontend.

| Category      | Technology                                                                                                  |
| :------------ | :---------------------------------------------------------------------------------------------------------- |
| **Frontend** | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)           |
| **Backend** | [Motoko](https://internetcomputer.org/docs/current/motoko/main/motoko), [Python](https://www.python.org/)     |
| **Blockchain**| [Internet Computer (ICP)](https://internetcomputer.org/)                                                      |
| **AI Agent** | [Fetch.ai (uAgents)](https://fetch.ai/), [Agentverse](https://agentverse.ai/)                                 |

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or later)
- [DFINITY Canister SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (`dfx`)
- [Python](https://www.python.org/downloads/) (v3.8 or later)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/learnsphere.git](https://github.com/your-username/learnsphere.git)
    cd learnsphere
    ```

2.  **Install Frontend Dependencies:**
    ```sh
    cd frontend
    npm install
    ```

3.  **Setup the Backend Canister:**
    - Start a local replica of the Internet Computer network:
        ```sh
        dfx start --background --clean
        ```
    - Deploy the `learnsphere` canister:
        ```sh
        dfx deploy
        ```

4.  **Setup the AI Agent:**
    - Navigate to the agent directory and install Python dependencies:
        ```sh
        cd ../backend/src/agent
        pip install -r requirements.txt
        ```
    - Run the agent (make sure to update the agent address in `ChatAssistant.jsx` if needed):
        ```sh
        python agent.py
        ```

5.  **Run the Frontend:**
    - Navigate back to the frontend directory and start the development server:
        ```sh
        cd ../../../frontend
        npm run dev
        ```

The application should now be running on `http://localhost:5173`.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
