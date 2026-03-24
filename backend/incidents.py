from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from database import incident_collection
from auth import get_current_user

router = APIRouter()

def serialize_doc(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.get("/incidents")
def get_all():
    return [serialize_doc(doc) for doc in incident_collection.find()]

@router.get("/incidents/{id}")
def get_one(id: str):
    doc = incident_collection.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return serialize_doc(doc)

@router.post("/incidents")
def create(incident: dict, user: str = Depends(get_current_user)):
    result = incident_collection.insert_one(incident)
    return {"id": str(result.inserted_id)}

@router.put("/incidents/{id}")
def update(id: str, incident: dict, user: str = Depends(get_current_user)):
    result = incident_collection.update_one({"_id": ObjectId(id)}, {"$set": incident})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "updated"}

@router.delete("/incidents/{id}")
def delete(id: str, user: str = Depends(get_current_user)):
    result = incident_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "deleted"}