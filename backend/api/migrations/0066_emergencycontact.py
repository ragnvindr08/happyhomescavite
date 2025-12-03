# Generated manually for EmergencyContact model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import simple_history.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0065_historicalvisitorrequest_pin_entered_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmergencyContact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the emergency contact (e.g., Police, Fire Department, Hospital)', max_length=255)),
                ('phone', models.CharField(help_text='Contact phone number', max_length=20)),
                ('description', models.TextField(blank=True, help_text='Description or additional information', null=True)),
                ('category', models.CharField(default='general', help_text='Category of emergency contact (police, fire, medical, security, etc.)', max_length=50)),
                ('is_active', models.BooleanField(default=True, help_text='Whether this contact is currently active')),
                ('order', models.IntegerField(default=0, help_text='Display order (lower numbers appear first)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Emergency Contact',
                'verbose_name_plural': 'Emergency Contacts',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='HistoricalEmergencyContact',
            fields=[
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('id', models.BigIntegerField(blank=True, db_index=True, null=True)),
                ('name', models.CharField(help_text='Name of the emergency contact (e.g., Police, Fire Department, Hospital)', max_length=255)),
                ('phone', models.CharField(help_text='Contact phone number', max_length=20)),
                ('description', models.TextField(blank=True, help_text='Description or additional information', null=True)),
                ('category', models.CharField(default='general', help_text='Category of emergency contact (police, fire, medical, security, etc.)', max_length=50)),
                ('is_active', models.BooleanField(default=True, help_text='Whether this contact is currently active')),
                ('order', models.IntegerField(default=0, help_text='Display order (lower numbers appear first)')),
                ('created_at', models.DateTimeField(blank=True, editable=False)),
                ('updated_at', models.DateTimeField(blank=True, editable=False)),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical Emergency Contact',
                'verbose_name_plural': 'historical Emergency Contacts',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
    ]

