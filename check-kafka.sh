#!/bin/bash

echo "🔍 Checking Kafka connectivity..."

# Check if Kafka is running
if ! docker ps | grep -q kafka; then
    echo "❌ Kafka container is not running!"
    echo "💡 Run: ./restart-kafka.sh to start Kafka"
    exit 1
fi

# Check if port 9092 is accessible
if ! nc -z localhost 9092 2>/dev/null; then
    echo "❌ Cannot connect to Kafka on localhost:9092"
    echo "💡 Kafka might still be starting up. Wait a few minutes and try again."
    exit 1
fi

echo "✅ Kafka is running and accessible on localhost:9092"

# Check Kafka logs for any errors
echo "📊 Recent Kafka logs:"
docker logs kafka --tail 10

echo "🎉 Kafka appears to be healthy!" 