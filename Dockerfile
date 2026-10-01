# ==============================================================================
# TracerEdge Multi-Stage Production Dockerfile
# Stage 1: Build Frontend with Node.js
# Stage 2: Serve Unified Application with Python FastAPI
# ==============================================================================

# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Low-memory environment configuration for Render 512MB limits
ENV PYTHONUNBUFFERED=1 \
    MALLOC_TRIM_THRESHOLD_=65536 \
    PYTHONMALLOC=malloc \
    PORT=8000

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose HTTP port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/api/info || exit 1

# Start TracerEdge unified server
CMD ["uvicorn", "main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]
