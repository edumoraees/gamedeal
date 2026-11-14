package br.edu.atitus.gamedeal.catalog.services;

import br.edu.atitus.gamedeal.catalog.dtos.*;
import br.edu.atitus.gamedeal.catalog.entities.ListingCategory;

import java.util.List;

public interface ListingService {

    PageResponse<ListingResponse> search(ListingCategory category, Long gameId, Long sellerId, String subcategory,
                                         String search, String currency, int page, int size, String sort);

    ListingResponse findPublicById(Long id, String currency);

    List<GameResponse> listGames();

    // ----- Área do vendedor (identidade vem dos cabeçalhos propagados pelo Gateway) -----

    ListingResponse create(Long sellerId, String sellerName, ListingRequest request);

    ListingResponse update(Long sellerId, Long listingId, ListingRequest request);

    ListingResponse changeStatus(Long sellerId, Long listingId, ListingStatusRequest request);

    void remove(Long sellerId, Long listingId);

    List<ListingResponse> findMine(Long sellerId);

    // ----- Uso interno (order-service) -----

    ListingResponse findInternal(Long id);

    ListingResponse reserve(Long id, int quantity);

    void release(Long id, int quantity);
}
