#!/bin/bash

echo "🔄 Stopping existing Kafka containers..."
cd src/kafka
docker-compose down -v

echo "🧹 Cleaning up any remaining containers..."
docker container prune -f

echo "🚀 Starting Kafka with updated configuration..."
docker-compose up -d

echo "⏳ Waiting for Kafka to be ready..."
sleep 30

echo "🔍 Checking Kafka status..."
docker-compose ps

echo "📊 Checking Kafka logs..."
docker-compose logs kafka

echo "✅ Kafka restart completed!"
echo "💡 If you still see connection issues, wait a few more minutes for Kafka to fully stabilize." 