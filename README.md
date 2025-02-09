# Coding-Crazy

Coding Crazy Senior Design Project

# 🌟 Phaser + React + Socket.io + Vite Game Project

Welcome to the **Game Project!** This project is built using **Phaser 3** and the **Vite** build tool, allowing for fast development and smooth gameplay.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

---

## **📥 Installation**

### **Clone the Repository**

```sh
git clone https://github.com/aidandoherty01/Coding-Crazy.git
cd Coding-Crazy
npm install
npm run dev

```

You should see ouput like this:
VITE v4.0.0 ready in 123ms
➜ Local: http://localhost:5173/
➜ Network: use --host to expose

## 👴 Git Branch Naming Guide

I know you guys know how to use GitHub but this is just for consistency and it looks pretty.

### 💰 Main Branches

- **`main`** – The stable, production-ready branch.
- **`develop`** – The active development branch where new features are merged before release.

---

### 🛠 Supporting Branches

| Prefix      | Purpose                                     | Example                     |
| ----------- | ------------------------------------------- | --------------------------- |
| `feat/`     | New features or major changes               | `feat/minigame-dodgeball`   |
| `fix/`      | Bug fixes in `develop` or `main`            | `fix/lobby-connection`      |
| `hotfix/`   | Urgent fixes directly for `main`            | `hotfix/game-crash`         |
| `refactor/` | Code improvements without changing features | `refactor/game-loop`        |
| `test/`     | Writing and improving test cases            | `test/minigame-integration` |
| `release/`  | Preparing a release version                 | `release/v1.0.0`            |
| `docs/`     | Documentation updates                       | `docs/api`                  |
| `exp/`      | Experimental features or prototypes         | `exp/texture-exploration`   |

---

### 🔄 Workflow Example

1. Make sure you are in **develop**
2. Run `git pull` to get the latest changes before creating a branch
3. Create a new branch with one of the prefixes above
   > Example: `git checkout -b feat/adding-sprite-movement`
4. Add and commit your changes
   > `git add .` > `git commit -m "my changes"`
5. Push yo branch & changes

   > `git push origin feat/adding-sprite-movement`

   > or if you want to be make multiple pushes you can do
   > `git push origin -u feat/adding-sprite-movement`,
   > then after initially pushing the branch you can just do
   > `git push`

6. Submit a PR in GitHub
   1. Go to project repo
   2. Click pull requests
   3. Select `base: develop` and `compare: your-branch-name`
   4. Add a comment
   5. Fix merge conflicts if any
   6. Let another teammate review changes and they can merge them
7. Boom
