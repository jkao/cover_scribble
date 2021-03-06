class ApplicationController < ActionController::Base
  protect_from_forgery
  helper_method :current_user
  helper_method :user_signed_in?
  helper_method :correct_user?

  before_filter :set_fb_params

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

  private
    def current_user
      begin
        @current_user ||= User.find(session[:user_id]) if session[:user_id]
      rescue Exception => e
        nil
      end
    end

    def user_signed_in?
      return true if current_user
    end

    def correct_user?
      @user = User.find(params[:id])
      unless current_user == @user
        redirect_to root_url, :alert => "Access denied."
      end
    end

    def authenticate_user!
      if !current_user
        redirect_to root_url, :alert => 'You need to sign in for access to this page.'
      end
    end

    def profile_picture_url(uid)
      "https://graph.facebook.com/#{uid}/picture?type=large"
    end

    def set_fb_params
      @fb_app_id = ENV['OMNIAUTH_PROVIDER_KEY']
    end

end
