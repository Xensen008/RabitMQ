import pika
import sys
import time

def publisher():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    # Create fanout exchange
    channel.exchange_declare(exchange='logs', exchange_type='fanout')

    # Publish messages
    for i in range(5):
        message = f'Broadcast message {i}'
        channel.basic_publish(
            exchange='logs',
            routing_key='',
            body=message
        )
        print(f" [x] Sent {message}")
    
    connection.close()

def subscriber():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    # Create fanout exchange
    channel.exchange_declare(exchange='logs', exchange_type='fanout')

    # Create temporary queue
    result = channel.queue_declare(queue='', exclusive=True)
    queue_name = result.method.queue

    # Bind queue to exchange
    channel.queue_bind(exchange='logs', queue=queue_name)

    def callback(ch, method, properties, body):
        print(f" [x] Received {body.decode()}")
        time.sleep(1)

    channel.basic_consume(
        queue=queue_name,
        on_message_callback=callback,
        auto_ack=True
    )

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        if len(sys.argv) > 1 and sys.argv[1] == 'publish':
            publisher()
        else:
            subscriber()
    except KeyboardInterrupt:
        print('Interrupted')
