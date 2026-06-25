from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_password_hash, get_current_user
from app.core.database import get_user_collection
from app.models.auth import UserResponse, UserCreate, UserUpdate, UserInDB

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse], summary="Get all users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Retrieve all users. Requires authentication.
    """
    users_collection = get_user_collection()
    users = await users_collection.find().to_list(1000)
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Create a new user")
async def create_user(user: UserCreate):
    """
    Create a new user. Does not require authentication for registration.
    """
    users_collection = get_user_collection()
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict.pop("password")
    
    user_in_db = UserInDB(**user_dict, hashed_password=hashed_password)
    db_user_dict = user_in_db.model_dump()
    await users_collection.insert_one(db_user_dict)
    
    return user_in_db


@router.get("/{username}", response_model=UserResponse, summary="Get a user by username")
async def get_user(username: str, current_user: dict = Depends(get_current_user)):
    """
    Get a specific user by username. Requires authentication.
    """
    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{username}", response_model=UserResponse, summary="Update a user")
async def update_user(username: str, user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    Update a specific user. Requires authentication. 
    Users can only update their own profile unless they are an admin.
    """
    # Simple authorization: only allow updating own profile for now
    if current_user.get("username") != username and current_user.get("username") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )

    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"]
        
    if update_data:
        await users_collection.update_one({"username": username}, {"$set": update_data})
        
    updated_user = await users_collection.find_one({"username": username})
    return updated_user


@router.delete("/{username}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a user")
async def delete_user(username: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a specific user. Requires authentication.
    Users can only delete their own profile unless they are an admin.
    """
    # Simple authorization: only allow deleting own profile for now
    if current_user.get("username") != username and current_user.get("username") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this user"
        )

    users_collection = get_user_collection()
    user = await users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    await users_collection.delete_one({"username": username})
    return None
