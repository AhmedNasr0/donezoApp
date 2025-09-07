-- Add whiteboard_item_id column to chats table
ALTER TABLE chats ADD COLUMN whiteboard_item_id UUID;

-- Add foreign key constraint with cascade delete
ALTER TABLE chats 
ADD CONSTRAINT fk_chats_whiteboard_item_id 
FOREIGN KEY (whiteboard_item_id) 
REFERENCES whiteboard_items(id) 
ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_chats_whiteboard_item_id ON chats(whiteboard_item_id);

-- Update existing chats to link them with their corresponding whiteboard items
-- This assumes that existing chats have the same ID as their whiteboard items
UPDATE chats 
SET whiteboard_item_id = id 
WHERE whiteboard_item_id IS NULL;
