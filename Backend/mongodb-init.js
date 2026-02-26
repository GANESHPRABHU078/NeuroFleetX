// MongoDB Initialization Script for NeuroFleetX
// Run this script using: mongosh neurofleetx mongodb-init.js

// Switch to neurofleetx database
db = db.getSiblingDB("neurofleetx");

// Drop existing collections if they exist
db.vehicles.drop();
db.drivers.drop();
db.telemetry.drop();

// Insert sample vehicles
db.vehicles.insertMany([
  {
    vin: "1HGBH41JXMN109186",
    model: "Tesla Model 3",
    status: "Active",
    createdAt: new Date(),
  },
  {
    vin: "2HGBH41JXMN109187",
    model: "Ford Transit",
    status: "Active",
    createdAt: new Date(),
  },
  {
    vin: "3HGBH41JXMN109188",
    model: "Mercedes Sprinter",
    status: "Inactive",
    createdAt: new Date(),
  },
]);

// Insert sample drivers
db.drivers.insertMany([
  {
    name: "John Doe",
    licenseNumber: "DL123456",
    phone: "+1-555-0100",
    createdAt: new Date(),
  },
  {
    name: "Jane Smith",
    licenseNumber: "DL789012",
    phone: "+1-555-0101",
    createdAt: new Date(),
  },
  {
    name: "Mike Johnson",
    licenseNumber: "DL345678",
    phone: "+1-555-0102",
    createdAt: new Date(),
  },
]);

// Get IDs for reference
const vehicles = db.vehicles.find().toArray();
const drivers = db.drivers.find().toArray();

// Insert sample telemetry data
db.telemetry.insertMany([
  {
    vehicleId: vehicles[0]._id.toString(),
    driverId: drivers[0]._id.toString(),
    latitude: NumberDecimal("37.7749295"),
    longitude: NumberDecimal("-122.4194155"),
    speed: NumberDecimal("45.50"),
    recordedAt: new Date(),
  },
  {
    vehicleId: vehicles[1]._id.toString(),
    driverId: drivers[1]._id.toString(),
    latitude: NumberDecimal("37.7849295"),
    longitude: NumberDecimal("-122.4294155"),
    speed: NumberDecimal("30.25"),
    recordedAt: new Date(),
  },
  {
    vehicleId: vehicles[2]._id.toString(),
    driverId: drivers[2]._id.toString(),
    latitude: NumberDecimal("37.7949295"),
    longitude: NumberDecimal("-122.4394155"),
    speed: NumberDecimal("0.00"),
    recordedAt: new Date(),
  },
]);

print("✓ Database initialized successfully!");
print("✓ Created " + db.vehicles.countDocuments() + " vehicles");
print("✓ Created " + db.drivers.countDocuments() + " drivers");
print("✓ Created " + db.telemetry.countDocuments() + " telemetry records");
