import asyncio
import logging
from typing import Dict, Any, Callable
from src.infrastructure.message_queue.redis_queue import redis_client
from src.core.config import settings

logger = logging.getLogger(__name__)

class QueueConsumer:
    def __init__(self, queue_name: str = settings.queue_name):
        self.queue_name = queue_name
        self.is_running = False
        self.workers = []
    
    async def start_consuming(self, message_handler: Callable, worker_count: int = settings.worker_concurrency):
        """Start multiple workers consuming messages from queue"""
        self.is_running = True
        logger.info(f"Starting {worker_count} workers for queue {self.queue_name}")
        
        # multiple worker tasks
        for i in range(worker_count):
            worker_task = asyncio.create_task(
                self._worker(f"worker-{i}", message_handler)
            )
            self.workers.append(worker_task)
        
        # Wait all workers to complete
        await asyncio.gather(*self.workers, return_exceptions=True)
    
    async def _worker(self, worker_name: str, message_handler: Callable):
        """Individual worker that processes messages"""
        logger.info(f"{worker_name} started")
        
        while self.is_running:
            try:
                message = await redis_client.pop_from_queue(self.queue_name, timeout=5)
                if message:
                    logger.info(f"{worker_name} processing message: {message}")
                    await message_handler(message)
                
            except Exception as e:
                logger.error(f"{worker_name} error processing message: {e}")
                await asyncio.sleep(1)
        
        logger.info(f"{worker_name} stopped")
    
    async def stop_consuming(self):
        """Stop all workers"""
        self.is_running = False
        
        for worker in self.workers:
            worker.cancel()
        
        logger.info("All queue workers stopped")