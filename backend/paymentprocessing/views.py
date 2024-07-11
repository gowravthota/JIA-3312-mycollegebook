from django.shortcuts import render
from rest_framework import serializers, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import User
from book_listings.models import ConnectionFeePaid, BookListing
from django.utils import timezone
from users.views import UserSerializer
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import stripe

# Create your views here.
stripe.api_key = settings.SECRET_STRIPE_KEY

class CreatePaymentIntent(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        #returns payment intent based on what they are buying
        try:
            print("in create intent")
            user = request.user
            location = str(request.data.get('location'))
            book_id = str(request.data.get('bookID'))
            print(location)
            print(book_id)
            if not user.stripe_id:
                full_name = f"{request.user.first_name} {request.user.last_name}"
                customer = stripe.Customer.create(
                    email= user.email,
                    name = full_name
                )
                user.stripe_id = customer.id
                user.save()
            stripe_id = user.stripe_id
            amount = 100
            payment_intent = stripe.PaymentIntent.create(
                        amount=amount,
                        currency='usd',
                        metadata={"book_id": book_id,
                                  "location": location,
                                   "Category": "Connection fee"},
                        automatic_payment_methods={'enabled': True, 'allow_redirects': 'never'},
                        customer=stripe_id
                    )
            print("success")
            return Response({
                        'clientSecret': payment_intent.client_secret
                    }, status=200)
        except stripe.error.StripeError as e:
            body = e.json_body

            return Response(
                {"status": 'failed', "detail": body}, status=400
            )
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
@csrf_exempt
def stripe_webhook(request):
    #some mumbo with drf parsing
    #need raw body for stripe verification
    #has to be http responses for a webhook
    #
    
    try:
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        webhook_secret = "whsec_FeVnMei49W1K8gZz6DMgRxL3GyBOirCB"
        event = stripe.Webhook.construct_event(
            request.body, sig_header, webhook_secret
        )
        print(event['type'])
        if event['type'] == 'charge.succeeded':
            #handle success
            print("in if")
            charge = event['data']['object']
            customer_id = charge['customer']  # Stripe Customer ID
            amount_paid = charge['amount']
            metadata = charge['metadata']
            print("metadata")
            print(metadata)
            book_listing_id = metadata["book_id"]
            user= User.objects.get(stripe_id = customer_id)
            print("before object creation ------")
            book_listing = BookListing.objects.get(id=book_listing_id)
            print("before cfp")
            cfp = ConnectionFeePaid.objects.create(
                user=user,
                book_listing=book_listing,
                amount=amount_paid,
                payment_date=timezone.now()
            )  
            print(cfp)


            return HttpResponse("Charge revieved. Connection fees recorded and book listing updated.", status=200)
        print("not handled event")
        return HttpResponse("Not a handled event", status=200)
        
    except Exception as e:
        # Invalid payload
        print("error here-------")
        print(e)
        return HttpResponse("error in webhook" + str(e), status=200)     
