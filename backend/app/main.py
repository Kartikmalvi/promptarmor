from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.services.classifier import classifier_service
from app.routes import classify, proxy

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block runs when the server starts up
    print("=========================================")
    print("Starting PromptArmor API...")
    print("Loading Machine Learning classifier...")
    classifier_service.load()
    print("PromptArmor is ready to protect!")
    print("=========================================")
    yield
    # Code after yield runs on shutdown

app = FastAPI(title="PromptArmor API", lifespan=lifespan)

# Enable CORS for all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to exactly your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers from our other files
app.include_router(classify.router)
app.include_router(proxy.router)

@app.get("/health")
async def health_check():
    classifier_status = "ready" if classifier_service.ready else "loading"
    return {
        "status": "ok",
        "version": "1.0.0",
        "classifier": classifier_status
    }

@app.get("/")
async def root():
    return {"message": "PromptArmor is running"}
