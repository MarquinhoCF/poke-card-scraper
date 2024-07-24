document.addEventListener('DOMContentLoaded', () => {
    const emailCheckbox = document.getElementById('email-checkbox');
    const smsCheckbox = document.getElementById('sms-checkbox');
    const telegramCheckbox = document.getElementById('telegram-checkbox');

    const notificationFields = document.getElementById('notification-fields');

    const emailField = document.getElementById('email-field');
    const smsField = document.getElementById('sms-field');
    const telegramField = document.getElementById('telegram-field');

    function updateNotificationFields() {
        let anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;

        notificationFields.classList.toggle('show', anyChecked);

        emailField.classList.toggle('show', emailCheckbox.checked);
        smsField.classList.toggle('show', smsCheckbox.checked);
        telegramField.classList.toggle('show', telegramCheckbox.checked);
    }

    emailCheckbox.addEventListener('change', updateNotificationFields);
    smsCheckbox.addEventListener('change', updateNotificationFields);
    telegramCheckbox.addEventListener('change', updateNotificationFields);

    updateNotificationFields();
});