class CoverPhotosController < ApplicationController
  before_filter :authenticate_user!

  # TODO: Implement security to check for friends
  def show
    @user = User.find_by_uid(params[:user_uid]) || not_found
    @profile_picture_url = profile_picture_url(@user.uid)
  end

  def create
    @image_url = params[:image_url]
    @cover_photo = CoverPhoto.new

    # TODO Facebook shit


  end

end
