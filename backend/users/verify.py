import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from phonenumber_field.phonenumber import PhoneNumber

TWILIO_VERIFY_SERVICE_SID = "VA2dee48ebf71834b3b86bb05949d30c1c"
TWILIO_ACCOUNT_SID = "AC0bfbf9095c9ddfa2a7e4ee7e12db3db4"
TWILIO_AUTH_TOKEN = "17cb9cba495ca0d453089de1ffcd4504"

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
verify = client.verify.services(TWILIO_VERIFY_SERVICE_SID)


def send_phone_verification(phone: PhoneNumber):
    verify.verifications.create(to=phone.as_e164, channel='sms')


def check_phone_verification(phone: PhoneNumber, code: str):
    try:
        result = verify.verification_checks.create(to=phone.as_e164, code=code)
        return result.status == 'approved'
    except TwilioRestException:
        return False


