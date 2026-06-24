from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models import Product

router = APIRouter(prefix="/produtos", tags=["Produtos"])

@router.get("/", response_model=List[Product])
def read_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products

@router.post("/", response_model=Product)
def create_or_update_product(product: Product, session: Session = Depends(get_session)):
    db_product = session.get(Product, product.id)
    if db_product:
        # Update product
        product_data = product.model_dump(exclude_unset=True)
        for key, value in product_data.items():
            setattr(db_product, key, value)
        session.add(db_product)
        session.commit()
        session.refresh(db_product)
        return db_product
    else:
        # Create product
        session.add(product)
        session.commit()
        session.refresh(product)
        return product
