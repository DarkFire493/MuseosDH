class RespuestaController < ApplicationController
  before_action :set_respuestum, only: [:show, :edit, :update, :destroy]



  # GET /segundarespuesta/new
  def new
    @respuestum = Respuestum.new
    @comentario = Comentario.find(params[:id])
  end

  # POST /segundarespuesta
  # POST /segundarespuesta.json
  def create

    @respuestum = Respuestum.new(respuestum_params)
    # @comentario = Comentario.find(params[:id])
    #nombre = params[:nombre]
    #correo = params[:correo]
    #comentario = params[:comentario]

    #@respuestum = Respuestum.create(:nombre => string, :correo => string, :descripcion => text,:comentario_id => @comentario.id)

    respond_to do |format|
      if @respuestum.save
        format.html { redirect_to comentarios_url}
        format.json { render :show, status: :created, location: @respuestum }
      else
        format.html { render :new }
        format.json { render json: @respuestum.errors, status: :unprocessable_entity }
      end
    end
  end


  # DELETE /segundarespuesta/1
  # DELETE /segundarespuesta/1.json
  def destroy
    @respuestum.destroy
    respond_to do |format|
      format.html { redirect_to comentarios_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_respuestum
      @respuestum = Respuestum.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def respuestum_params
      params.require(:respuestum).permit(:nombre, :correo, :descripcion, :comentario_id)
    end
end
