Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook,
    ENV['OMNIAUTH_PROVIDER_KEY'],
    ENV['OMNIAUTH_PROVIDER_SECRET'],
    { :scope => "publish_stream,offline_access,email" }
end
