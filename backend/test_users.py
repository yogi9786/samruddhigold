import asyncio
from sqlalchemy import text
from app.core.database import engine

async def run():
    async with engine.begin() as conn:
        res = await conn.execute(text('SELECT * FROM users'))
        users = res.fetchall()
        for u in users:
            print(u)

if __name__ == '__main__':
    asyncio.run(run())
