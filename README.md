# ⚡ TracerEdge | Institutional Indian Equity Screener

**TracerEdge** is a minimalist, high-speed, real-time stock screener designed for the complete Indian market across both the **National Stock Exchange (NSE)** and **Bombay Stock Exchange (BSE)**.

---

## 🌟 Key Highlights

- **Complete Indian Market Universe**: Tracks all **7,640+** active equities (**2,587 pure NSE** equities and **5,053 pure BSE** equities with official scrip codes).
- **Zero Simulated Ticks When Market Closes**: Outside trading hours (09:15–15:30 IST weekdays), simulated price drift is completely disabled.
- **Verified Official EOD Settlement**: Directly pulls official end-of-day settlement Bhavcopies from NSE and BSE, verifying exact closing prices with zero discrepancy.
- **Minimalist & High-Contrast UI**: Institutional design language with instant Dark/Light theme toggle, engineered for crystal-clear readability.
- **Mobile & Tablet Optimized**: Sticky stock headers on horizontal scroll, responsive drawers, and touch-friendly controls.
- **Unified Single-Server Architecture**: No separate frontend dev server required in production. A single high-performance FastAPI/Uvicorn server delivers the optimized React frontend, REST endpoints, and live WebSocket streaming.

---

## 🚀 Quick Start (Local Run)

### Windows
Double-click `start_traceredge.bat` or run:
```cmd
.\start_traceredge.bat
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Linux / macOS
Make the script executable and launch:
```bash
chmod +x start_traceredge.sh
./start_traceredge.sh
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🌐 Production Hosting Guide

TracerEdge is designed for seamless, one-command deployment to any cloud provider or server.

### Option 1: Docker / Docker Compose (Recommended for Any Cloud)

Run with Docker Compose:
```bash
docker compose up -d --build
```
Your instance will be running on port `8000`.

### Option 2: Cloud Container Platforms (Render, Railway, Fly.io, DigitalOcean)

1. Connect your Git repository to **Render**, **Railway**, or **Fly.io**.
2. Select **Docker** environment (TracerEdge has a multi-stage `Dockerfile` ready).
3. Set the internal port to `8000`.
4. Deploy! The multi-stage build will compile the frontend and start the Python server automatically.

### Option 3: Linux VPS (Ubuntu / Debian with systemd & Nginx)

1. **Clone the repository on your VPS**:
   ```bash
   git clone https://github.com/your-username/traceredge.git /opt/traceredge
   cd /opt/traceredge
   ```

2. **Build frontend assets (done once)**:
   ```bash
   cd frontend
   npm ci
   npm run build
   cd ..
   ```

3. **Install Python environment**:
   ```bash
   python3 -m venv venv
   ./venv/bin/pip install --upgrade pip
   ./venv/bin/pip install -r backend/requirements.txt
   ```

4. **Create systemd service (`/etc/systemd/system/traceredge.service`)**:
   ```ini
   [Unit]
   Description=TracerEdge Stock Screener
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/opt/traceredge
   ExecStart=/opt/traceredge/venv/bin/uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --workers 2
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now traceredge
   ```

5. **Nginx Reverse Proxy with WebSocket Support (`/etc/nginx/sites-available/traceredge`)**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   Add SSL with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🛠️ Project Architecture

```
Stock Market/
├── backend/
│   ├── main.py              # FastAPI server (API, WebSockets, SPA Static mounting)
│   ├── data_engine.py       # Engine managing 7,640+ equities & official Bhavcopies
│   ├── universe_manager.py  # Dual-exchange symbol and scrip indexing
│   ├── universe_sync.py     # Exchange master synchronization
│   ├── indicators.py        # Technical indicators (RSI, MACD, Bollinger, SMAs)
│   ├── stocks_data.py       # Pre-indexed reference data and indices
│   └── requirements.txt     # Python production dependencies
├── frontend/
│   ├── dist/                # Production build output served by FastAPI
│   ├── src/
│   │   ├── components/      # React components (Header, Table, Heatmap, ChartModal)
│   │   ├── hooks/           # useLiveMarket real-time hook
│   │   ├── services/        # Dynamic API & WebSocket client
│   │   ├── App.jsx          # Root application
│   │   └── index.css        # Minimalist institutional Dark/Light CSS
│   ├── index.html           # TracerEdge HTML entrypoint
│   └── package.json         # Frontend dependencies
├── Dockerfile               # Production multi-stage Docker build
├── docker-compose.yml       # Production Compose configuration
├── start_traceredge.bat     # Windows production launcher
├── start_traceredge.sh      # Linux/macOS production launcher
└── README.md
```

---

## ⚖️ License
TracerEdge is released under the MIT License.
