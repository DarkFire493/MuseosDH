class QrCodesController < ApplicationController
	require 'rqrcode_png'

  def new
  end

  def create
    @qr = RQRCode::QRCode.new( qr_code_params[:tipo_descuento], size: 8, :level => :h)
    png = @qr.to_img												
    # returns an instance of ChunkyPNG
    png.resize(450, 450).save("app/assets/images/qrcodes/qr_image#{@tipo_descuento}.png")
  end

private
  def qr_code_params
    params.require(:qr_code).permit(:tipo_descuento)
  end
end