import { Resend } from 'resend';

const resend = new Resend('re_HrbxNKip_ACQQqRE2iUfZvPW9mtagzxVA');

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Tork3D <onboarding@resend.dev>',
      to: ['tork3d.design@gmail.com'],
      subject: 'Test Email',
      html: '<p>Test</p>'
    });

    if (error) {
      console.error('Resend Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Caught Error:', err);
  }
}

test();
