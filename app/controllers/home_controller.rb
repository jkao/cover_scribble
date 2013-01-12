class HomeController < ApplicationController
  before_filter :authenticate_user!, :only => [:app]

  def index
    redirect_to app_path(:user_uid => current_user.uid) if user_signed_in?
  end

end
