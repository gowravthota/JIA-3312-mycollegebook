from django.core.management import call_command
from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def add_universities(sender, **kwargs):
    if sender.name == 'users':
        call_command('adduniversities')