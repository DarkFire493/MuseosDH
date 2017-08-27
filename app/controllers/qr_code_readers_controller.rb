class QrCodeReadersController < ApplicationController
  before_action :set_qr_code_reader, only: [:show, :edit, :update, :destroy]

  # GET /qr_code_readers
  # GET /qr_code_readers.json
  def index
    @qr_code_readers = QrCodeReader.all
  end

  # GET /qr_code_readers/1
  # GET /qr_code_readers/1.json
  def show
  end

  # GET /qr_code_readers/new
  def new
    @qr_code_reader = QrCodeReader.new
  end

  # GET /qr_code_readers/1/edit
  def edit
  end

  # POST /qr_code_readers
  # POST /qr_code_readers.json
  def create
    @qr_code_reader = QrCodeReader.new(qr_code_reader_params)

    respond_to do |format|
      if @qr_code_reader.save
        format.html { redirect_to @qr_code_reader, notice: 'Se guardó exitosamente el registro.' }
        format.json { render :show, status: :created, location: @qr_code_reader }
      else
        format.html { render :new }
        format.json { render json: @qr_code_reader.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /qr_code_readers/1
  # PATCH/PUT /qr_code_readers/1.json
  def update
    respond_to do |format|
      if @qr_code_reader.update(qr_code_reader_params)
        format.html { redirect_to @qr_code_reader, notice: 'Se actualizó exitosamente el registro.' }
        format.json { render :show, status: :ok, location: @qr_code_reader }
      else
        format.html { render :edit }
        format.json { render json: @qr_code_reader.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /qr_code_readers/1
  # DELETE /qr_code_readers/1.json
  def destroy
    @qr_code_reader.destroy
    respond_to do |format|
      format.html { redirect_to qr_code_readers_url, notice: 'Se eliminó exitosamente el registro.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_qr_code_reader
      @qr_code_reader = QrCodeReader.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def qr_code_reader_params
      params.require(:qr_code_reader).permit(:disscount, :person, :checkin)
    end
end
