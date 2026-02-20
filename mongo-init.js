db = db.getSiblingDB("practiceDB");
db.createUser({
  user: "root",
  pwd: "henriettaNybble2025",
  roles: [{ role: "readWrite", db: "henriettaDB" }],
});

