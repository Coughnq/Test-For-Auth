const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const token = event.headers.authorization?.split(' ')[1];

  if (!token) {
    return {
      statusCode: 302,
      headers: {
        'Location': '/index.html',
      },
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/index.html',
        },
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: require('fs').readFileSync('public/app.html', 'utf8'),
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': '/index.html',
      },
    };
  }
};
