import pika
import time

# Connection parameters
credentials = pika.PlainCredentials('guest', 'guest')
parameters = pika.ConnectionParameters('localhost', 5672, '/', credentials)

def producer():
    # Establish connection
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Create queue
    channel.queue_declare(queue='basic_queue')
    
    # Send messages
    for i in range(5):
        message = f"Message {i}"
        channel.basic_publish(
            exchange='',
            routing_key='basic_queue',
            body=message
        )
        print(f" [x] Sent {message}")
    
    connection.close()

def consumer():
    # Establish connection
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Create queue
    channel.queue_declare(queue='basic_queue')
    
    def callback(ch, method, properties, body):
        print(f" [x] Received {body.decode()}")
        time.sleep(1)  # Simulate processing time
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    # Set up consumer
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(
        queue='basic_queue',
        on_message_callback=callback
    )
    
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    # Run producer and consumer in sequence for demonstration
    try:
        producer()
        consumer()
    except KeyboardInterrupt:
        print('Interrupted')
