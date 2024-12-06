import pika
import time
from datetime import datetime

def fifo_producer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    # Declare a durable queue
    channel.queue_declare(queue='fifo_queue', durable=True, arguments={
        'x-message-ttl': 3600000  # 1 hour TTL
    })

    # Send numbered messages
    for i in range(10):
        message = f'Message {i} sent at {datetime.now()}'
        channel.basic_publish(
            exchange='',
            routing_key='fifo_queue',
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
            ))
        print(f" [x] Sent {message}")
        time.sleep(0.5)  # Small delay between messages

    connection.close()

def fifo_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    channel.queue_declare(queue='fifo_queue', durable=True, arguments={
        'x-message-ttl': 3600000  # 1 hour TTL
    })

    def callback(ch, method, properties, body):
        message = body.decode()
        print(f" [x] Received {message}")
        time.sleep(1)  # Simulate processing time
        ch.basic_ack(delivery_tag=method.delivery_tag)

    # Set prefetch count to 1 for strict ordering
    channel.basic_qos(prefetch_count=1)
    
    channel.basic_consume(
        queue='fifo_queue',
        on_message_callback=callback
    )

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        # Run producer first, then consumer
        fifo_producer()
        fifo_consumer()
    except KeyboardInterrupt:
        print('Interrupted')
