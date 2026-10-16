// Sample graph for Sara's house.
// Safe to run again: every node is merged on a stable id.
// Page text lives here. Button and label text lives in web/src/i18n/en.js.

CREATE CONSTRAINT house_id IF NOT EXISTS FOR (h:House) REQUIRE h.id IS UNIQUE;
CREATE CONSTRAINT photo_id IF NOT EXISTS FOR (p:Photo) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT activity_id IF NOT EXISTS FOR (a:Activity) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT day_date IF NOT EXISTS FOR (d:Day) REQUIRE d.date IS UNIQUE;
CREATE CONSTRAINT booking_id IF NOT EXISTS FOR (b:Booking) REQUIRE b.id IS UNIQUE;

MERGE (h:House {id: 'sara'})
SET h.name = "Sara's house",
    h.summary = "A small brick cottage you can book by the day. The pictures and activities on this site are sample content, standing in until the real house is written in.",
    h.location = "A quiet lane, a short walk from the village.";

MATCH (h:House {id: 'sara'})
MERGE (p:Photo {id: 'front'})
SET p.file = 'front.jpg',
    p.caption = "The front of the house, from the path. The green door is the one you arrive at.",
    p.sort = 1
MERGE (h)-[:HAS_PHOTO]->(p);

MATCH (h:House {id: 'sara'})
MERGE (p:Photo {id: 'kitchen'})
SET p.file = 'kitchen.jpg',
    p.caption = "The kitchen. The table seats four, and the window looks out over the fields.",
    p.sort = 2
MERGE (h)-[:HAS_PHOTO]->(p);

MATCH (h:House {id: 'sara'})
MERGE (p:Photo {id: 'bedroom'})
SET p.file = 'bedroom.jpg',
    p.caption = "The bedroom. White linens, and a window onto the garden.",
    p.sort = 3
MERGE (h)-[:HAS_PHOTO]->(p);

MATCH (h:House {id: 'sara'})
MERGE (p:Photo {id: 'garden'})
SET p.file = 'garden.jpg',
    p.caption = "The garden behind the house. There are beds of vegetables and a table for the afternoon.",
    p.sort = 4
MERGE (h)-[:HAS_PHOTO]->(p);

MATCH (h:House {id: 'sara'})
MERGE (a:Activity {id: 'market'})
SET a.name = 'Village market',
    a.kind = 'Market',
    a.summary = 'Stalls with bread, fruit, and flowers. Sample activity, not a real listing.'
MERGE (h)-[r:NEAR]->(a)
SET r.note = 'About a ten-minute walk.';

MATCH (h:House {id: 'sara'})
MERGE (a:Activity {id: 'towpath'})
SET a.name = 'Canal towpath',
    a.kind = 'Walk',
    a.summary = 'A flat walk along the water, good in the morning. Sample activity, not a real listing.'
MERGE (h)-[r:NEAR]->(a)
SET r.note = 'The start of the path is across the lane.';

MATCH (h:House {id: 'sara'})
MERGE (a:Activity {id: 'bakery'})
SET a.name = 'The corner bakery',
    a.kind = 'Food',
    a.summary = 'Opens early and sells out of the morning buns. Sample activity, not a real listing.'
MERGE (h)-[r:NEAR]->(a)
SET r.note = 'In the village, past the market square.';

MATCH (h:House {id: 'sara'})
MERGE (a:Activity {id: 'woods'})
SET a.name = 'Woodland loop',
    a.kind = 'Walk',
    a.summary = 'A shaded loop through the trees, about an hour at an easy pace. Sample activity, not a real listing.'
MERGE (h)-[r:NEAR]->(a)
SET r.note = 'Follow the lane away from the village, then take the first track on the left.';

MATCH (h:House {id: 'sara'})
WITH h, date() AS today
UNWIND range(0, 89) AS offset
WITH h, today + duration({days: offset}) AS day
MERGE (d:Day {date: toString(day)})
MERGE (h)-[:OFFERS]->(d);

MATCH (h:House {id: 'sara'})
MATCH (d:Day {date: toString(date() + duration({days: 4}))})
MERGE (b:Booking {id: 'sample-1'})
SET b.guestName = 'Sample guest',
    b.note = 'Sample booking so the calendar has a taken day.',
    b.createdAt = datetime()
MERGE (b)-[:ON]->(d)
MERGE (b)-[:AT]->(h);

MATCH (h:House {id: 'sara'})
MATCH (d:Day {date: toString(date() + duration({days: 11}))})
MERGE (b:Booking {id: 'sample-2'})
SET b.guestName = 'Sample guest',
    b.note = 'Sample booking so the calendar has a taken day.',
    b.createdAt = datetime()
MERGE (b)-[:ON]->(d)
MERGE (b)-[:AT]->(h);

MATCH (h:House {id: 'sara'})
MATCH (d:Day {date: toString(date() + duration({days: 18}))})
MERGE (b:Booking {id: 'sample-3'})
SET b.guestName = 'Sample guest',
    b.note = 'Sample booking so the calendar has a taken day.',
    b.createdAt = datetime()
MERGE (b)-[:ON]->(d)
MERGE (b)-[:AT]->(h);
