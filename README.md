# 🎡 MEANDER Lucky Wheel

Gift campaign spinning wheel app for MEANDER hotel branches.
Built with React + Vite. Deployed via GitHub Pages (no server needed).

## Branches
- 🇹🇼 Meander Taipei
- 🇯🇵 Meander Osaka
- 🇻🇳 Meander Saigon
- 🏮 Meander 1948

---

## 🚀 Deploy to GitHub Pages (5 minutes)

### Step 1 — Create GitHub repo
1. Go to [github.com/new](https://github.com/new)
2. Name it exactly: `meander-lucky-wheel`
3. Keep it **Public** (required for free GitHub Pages)
4. Click **Create repository**

### Step 2 — Push this code
```bash
cd meander-lucky-wheel
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/meander-lucky-wheel.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Step 4 — Wait ~2 minutes
GitHub Actions will automatically build and deploy.
Your app will be live at:
```
https://YOUR_USERNAME.github.io/meander-lucky-wheel/
```

---

## 🔧 Local development

```bash
npm install
npm run dev
```

---

## 🔐 Admin Panel

Tap the **⋮ menu dots** (top right) **5 times** to open the admin panel.

Default password: `meander2025`

Change it in `src/data/constants.js`:
```js
export const ADMIN_PASSWORD = 'your_new_password'
```

---

## 📦 Features
- Equal-size wheel slices (probability is hidden)
- Weighted random logic per branch
- Inventory management with auto-depletion
- Per-branch data (Taipei / Osaka / Saigon / 1948)
- localStorage persistence (survives refresh)
- Admin panel: edit stock, weights, export/import JSON, spin history
- Confetti + reward popup
- Works on iPad + mobile

## 🎁 Default Rewards
| Prize | Tier | Default Weight |
|-------|------|---------------|
| Waterproof Toiletry Bag | Rare | 5 |
| Konnyaku Toothpaste | Common | 35 |
| Organic Bamboo Toothbrush | Common | 30 |
| Eco Fabric Laundry Mousse | Common | 28 |
| Antibacterial Garment Mist | Uncommon | 15 |
| SHIZUKU Osaka Towel | Uncommon | 12 |
| 10th Anniversary Socks | Ultra Rare | 3 |
