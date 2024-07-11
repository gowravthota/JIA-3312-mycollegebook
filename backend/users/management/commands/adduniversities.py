import requests
from django.core.management.base import BaseCommand, CommandError
from users.models import University, UniversityDomain


# This command only collects US Universities, you can remove the filter if necessary.
class Command(BaseCommand):
    help = "Populates the database with Universities and their associated url domains."

    def handle(self, *args, **options):
        result = requests.get(
            "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json"
        )

        if result.status_code != 200:
            raise CommandError(
                "Failed to collect Universities from Hipo/university-domains-list repo on GitHub."
            )

        result_json = result.json()

        unis = []
        uni_domains = []

        for university_json in result_json:
            name = university_json["name"]
            country = university_json["country"]
            alpha_two_code = university_json["alpha_two_code"]
            # domains = university_json["domains"]

            if alpha_two_code != "US":
                continue

            uni = University(
                name=name,
                country=country,
                alpha_two_code=alpha_two_code,
            )
            unis.append(uni)

        University.objects.bulk_create(unis, ignore_conflicts=True)

        uni_map = {
            uni.name: uni
            for uni in University.objects.filter(name__in=[uni.name for uni in unis])
        }

        for university_json in result_json:
            if university_json["alpha_two_code"] != "US":
                continue

            uni = uni_map[university_json["name"]]
            for domain in university_json["domains"]:
                uni_domain = UniversityDomain(name=domain, university=uni)
                uni_domains.append(uni_domain)

        UniversityDomain.objects.bulk_create(uni_domains, ignore_conflicts=True)
